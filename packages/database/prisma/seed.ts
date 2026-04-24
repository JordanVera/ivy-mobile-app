/**
 * Seed script for local development. Currently seeds a single upcoming
 * Monday Mentorship Moment live event. Safe to re-run: uses a stable ID
 * so repeated runs update the same row.
 *
 * Run with:
 *   npm run -w @ivy/database db:seed
 *
 * To schedule a different event, edit the values below or override via
 * environment variables:
 *   MMM_SEED_VIDEO_ID=<youtube id>
 *   MMM_SEED_STARTS_AT=<ISO 8601 datetime>
 *   MMM_SEED_DURATION_MINUTES=<number>
 */
import { prisma } from '../src';

const SEED_EVENT_ID = 'seed-mmm-next';

function resolveStartsAt(): Date {
  const override = process.env.MMM_SEED_STARTS_AT?.trim();
  if (override) {
    const parsed = new Date(override);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    console.warn(
      `[seed] MMM_SEED_STARTS_AT "${override}" is not a valid date; falling back to next Monday @ 7pm.`,
    );
  }
  // Next Monday at 19:00 local time.
  const next = new Date();
  const day = next.getDay(); // 0 = Sun, 1 = Mon
  const daysUntilMonday = (1 + 7 - day) % 7 || 7;
  next.setDate(next.getDate() + daysUntilMonday);
  next.setHours(19, 0, 0, 0);
  return next;
}

function resolveDuration(): number {
  const raw = process.env.MMM_SEED_DURATION_MINUTES;
  if (!raw) return 60;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 60;
}

/**
 * Canonical SOAR Hubs that power "The Nest" tab. Identified by stable `slug`
 * so the seed is safe to re-run and front-end code can deep-link to a hub by
 * slug rather than relying on a generated id.
 */
const SEED_HUBS: Array<{
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  sortOrder: number;
}> = [
  {
    slug: 'entrepreneurs',
    name: 'Entrepreneurs',
    tagline: 'Build your vision with peers in the arena.',
    description:
      'For founders, operators, and side-hustlers turning ideas into income and impact.',
    icon: 'briefcase.fill',
    sortOrder: 10,
  },
  {
    slug: 'college-life',
    name: 'College Life',
    tagline: 'Grow through your campus chapter together.',
    description:
      'Students navigating school, identity, and calling — leaning into community along the way.',
    icon: 'graduationcap.fill',
    sortOrder: 20,
  },
  {
    slug: 'golden-age',
    name: 'Golden Age',
    tagline: 'Wisdom shared. Legacy lived.',
    description:
      'Seasoned members pouring decades of life into the next generation while still being poured into.',
    icon: 'sun.max.fill',
    sortOrder: 30,
  },
  {
    slug: 'ahh-man',
    name: 'Ahh Man',
    tagline: 'Brothers sharpening brothers.',
    description:
      'A space for the men of SOAR — real talk, accountability, faith, and forward motion.',
    icon: 'figure.stand',
    sortOrder: 40,
  },
];

async function seedLiveEvent() {
  const startsAt = resolveStartsAt();
  const durationMinutes = resolveDuration();
  const youtubeVideoId =
    process.env.MMM_SEED_VIDEO_ID?.trim() || 'dQw4w9WgXcQ';

  await prisma.liveEvent.upsert({
    where: { id: SEED_EVENT_ID },
    update: {
      title: 'Monday Mentorship Moment — Live',
      description:
        'Join the monthly live Monday Mentorship Moment. Bring a notebook, a question, and a willingness to grow.',
      youtubeVideoId,
      startsAt,
      durationMinutes,
    },
    create: {
      id: SEED_EVENT_ID,
      title: 'Monday Mentorship Moment — Live',
      description:
        'Join the monthly live Monday Mentorship Moment. Bring a notebook, a question, and a willingness to grow.',
      youtubeVideoId,
      startsAt,
      durationMinutes,
    },
  });

  console.log(
    `[seed] Upserted LiveEvent id=${SEED_EVENT_ID} startsAt=${startsAt.toISOString()} videoId=${youtubeVideoId}`,
  );
}

async function seedHubs() {
  for (const hub of SEED_HUBS) {
    await prisma.hub.upsert({
      where: { slug: hub.slug },
      update: {
        name: hub.name,
        tagline: hub.tagline,
        description: hub.description,
        icon: hub.icon,
        sortOrder: hub.sortOrder,
      },
      create: hub,
    });
    console.log(`[seed] Upserted Hub slug=${hub.slug}`);
  }
}

async function main() {
  await seedLiveEvent();
  await seedHubs();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
