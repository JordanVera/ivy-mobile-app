import { TRPCError } from '@trpc/server';

import { DEFAULT_YOUTUBE_PLAYLIST_ID, fetchPlaylistVideos } from '../lib/youtube-playlist';
import { publicProcedure, router } from '../trpc';

export const youtubeRouter = router({
  playlistVideos: publicProcedure.query(async () => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey?.trim()) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message:
          'Missing YOUTUBE_API_KEY. Add it to apps/web/.env (see apps/web/.env.example) and restart Next.js.',
      });
    }

    const playlistId =
      process.env.YOUTUBE_PLAYLIST_ID?.trim() || DEFAULT_YOUTUBE_PLAYLIST_ID;

    const videos = await fetchPlaylistVideos(apiKey.trim(), playlistId);
    return { playlistId, videos };
  }),
});
