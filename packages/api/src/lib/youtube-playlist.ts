import { TRPCError } from '@trpc/server';

const YOUTUBE_DATA_V3 = 'https://www.googleapis.com/youtube/v3';

/** Default “#MMM” playlist from product URL. Override with `YOUTUBE_PLAYLIST_ID`. */
export const DEFAULT_YOUTUBE_PLAYLIST_ID = 'PL3L7uqjW75F4AXIHPq2xrm7o9NHmTquXr';

const MAX_PLAYLIST_ITEMS = 200;

export type PlaylistVideo = {
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
  durationLabel: string;
  live: boolean;
};

type PlaylistItemsResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
      thumbnails?: {
        medium?: { url?: string };
        default?: { url?: string };
        high?: { url?: string };
      };
      resourceId?: { videoId?: string };
      liveBroadcastContent?: string;
    };
    contentDetails?: { videoId?: string };
  }>;
  nextPageToken?: string;
  error?: { message?: string };
};

type VideosListResponse = {
  items?: Array<{
    id?: string;
    contentDetails?: { duration?: string };
    snippet?: { liveBroadcastContent?: string };
  }>;
  error?: { message?: string };
};

function formatIsoDuration(iso: string | undefined): string {
  if (!iso || iso === 'P0D') return '--:--';
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '--:--';
  const h = Number(m[1] ?? 0);
  const min = Number(m[2] ?? 0);
  const s = Number(m[3] ?? 0);
  if (h > 0) {
    return `${h}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${min}:${String(s).padStart(2, '0')}`;
}

async function youtubeJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) {
    const msg = data.error?.message ?? res.statusText;
    throw new TRPCError({
      code: res.status === 403 || res.status === 401 ? 'FORBIDDEN' : 'BAD_REQUEST',
      message: `YouTube API: ${msg}`,
    });
  }
  if (data.error?.message) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `YouTube API: ${data.error.message}`,
    });
  }
  return data;
}

export async function fetchPlaylistVideos(
  apiKey: string,
  playlistId: string,
): Promise<PlaylistVideo[]> {
  const collected: NonNullable<PlaylistItemsResponse['items']> = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      maxResults: '50',
      playlistId,
      key: apiKey,
    });
    if (pageToken) params.set('pageToken', pageToken);

    const list = await youtubeJson<PlaylistItemsResponse>(
      `${YOUTUBE_DATA_V3}/playlistItems?${params}`,
    );
    if (list.items?.length) collected.push(...list.items);
    pageToken = list.nextPageToken;
    if (collected.length >= MAX_PLAYLIST_ITEMS) break;
  } while (pageToken);

  const trimmed = collected.slice(0, MAX_PLAYLIST_ITEMS);

  const videoIds = trimmed
    .map((row) => row.contentDetails?.videoId ?? row.snippet?.resourceId?.videoId)
    .filter((id): id is string => Boolean(id));

  const uniqueIds = Array.from(new Set(videoIds));

  const durationById = new Map<string, string>();
  const liveFromVideo = new Map<string, boolean>();

  const chunkSize = 50;
  for (let i = 0; i < uniqueIds.length; i += chunkSize) {
    const chunk = uniqueIds.slice(i, i + chunkSize);
    const params = new URLSearchParams({
      part: 'contentDetails,snippet',
      id: chunk.join(','),
      key: apiKey,
    });
    const videos = await youtubeJson<VideosListResponse>(`${YOUTUBE_DATA_V3}/videos?${params}`);
    for (const item of videos.items ?? []) {
      if (!item.id) continue;
      if (item.contentDetails?.duration) {
        durationById.set(item.id, formatIsoDuration(item.contentDetails.duration));
      }
      const liveSnippet = item.snippet?.liveBroadcastContent;
      if (liveSnippet === 'live' || liveSnippet === 'upcoming') {
        liveFromVideo.set(item.id, true);
      }
    }
  }

  const result: PlaylistVideo[] = [];

  for (const row of trimmed) {
    const videoId = row.contentDetails?.videoId ?? row.snippet?.resourceId?.videoId;
    if (!videoId) continue;

    const title = row.snippet?.title?.trim() ?? 'Untitled';
    if (title === 'Deleted video' || title === 'Private video') continue;

    const thumb =
      row.snippet?.thumbnails?.medium?.url ??
      row.snippet?.thumbnails?.high?.url ??
      row.snippet?.thumbnails?.default?.url ??
      null;

    const snippetLive = row.snippet?.liveBroadcastContent;
    const live =
      snippetLive === 'live' ||
      snippetLive === 'upcoming' ||
      liveFromVideo.get(videoId) === true;

    const durationLabel = live ? 'LIVE' : (durationById.get(videoId) ?? '--:--');

    result.push({
      videoId,
      title,
      thumbnailUrl: thumb,
      durationLabel,
      live,
    });
  }

  return result;
}
