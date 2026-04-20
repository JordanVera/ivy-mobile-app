import { createClerkClient } from '@clerk/backend';
import type { UserJSON } from '@clerk/backend';
import type { User as ClerkUser } from '@clerk/backend';
import { TRPCError } from '@trpc/server';
import type { PrismaClient, User } from '@ivy/database';

function primaryEmailFromJson(user: UserJSON): string | null {
  const primaryId = user.primary_email_address_id;
  const fromPrimary = user.email_addresses?.find((e) => e.id === primaryId);
  if (fromPrimary) return fromPrimary.email_address;
  return user.email_addresses?.[0]?.email_address ?? null;
}

function primaryEmailFromApi(user: ClerkUser): string | null {
  const addresses = user.emailAddresses ?? [];
  const primaryId = user.primaryEmailAddressId;
  const fromPrimary = addresses.find((e) => e.id === primaryId);
  if (fromPrimary) return fromPrimary.emailAddress;
  return addresses[0]?.emailAddress ?? null;
}

async function upsertNormalized(
  prisma: PrismaClient,
  n: {
    clerkUserId: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  },
): Promise<User> {
  return prisma.user.upsert({
    where: { clerkUserId: n.clerkUserId },
    create: {
      clerkUserId: n.clerkUserId,
      email: n.email,
      firstName: n.firstName,
      lastName: n.lastName,
      imageUrl: n.imageUrl,
    },
    update: {
      email: n.email,
      firstName: n.firstName,
      lastName: n.lastName,
      imageUrl: n.imageUrl,
    },
  });
}

export async function upsertUserFromClerkUserJSON(
  prisma: PrismaClient,
  user: UserJSON,
): Promise<User> {
  return upsertNormalized(prisma, {
    clerkUserId: user.id,
    email: primaryEmailFromJson(user),
    firstName: user.first_name ?? null,
    lastName: user.last_name ?? null,
    imageUrl: user.image_url ?? null,
  });
}

export async function upsertUserFromClerkApiUser(
  prisma: PrismaClient,
  user: ClerkUser,
): Promise<User> {
  return upsertNormalized(prisma, {
    clerkUserId: user.id,
    email: primaryEmailFromApi(user),
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    imageUrl: user.imageUrl ?? null,
  });
}

export async function deleteUserByClerkId(
  prisma: PrismaClient,
  clerkUserId: string,
): Promise<void> {
  await prisma.user.deleteMany({ where: { clerkUserId } });
}

/**
 * Ensures a local `User` row exists for this Clerk user. Used after sign-in when the
 * webhook may not have run yet (race) or failed (retry).
 */
function requireClerkSecretKey(): string {
  const secret = process.env.CLERK_SECRET_KEY?.trim();
  if (!secret) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message:
        'Missing CLERK_SECRET_KEY. Add it to apps/web/.env so the API can sync users from Clerk.',
    });
  }
  return secret;
}

export async function ensureUserForClerkId(
  prisma: PrismaClient,
  clerkUserId: string,
): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { clerkUserId } });
  if (existing) return existing;

  const clerk = createClerkClient({ secretKey: requireClerkSecretKey() });
  const user = await clerk.users.getUser(clerkUserId);
  return upsertUserFromClerkApiUser(prisma, user);
}

/**
 * Re-fetches the user from Clerk and upserts into our DB (name, email, avatar).
 */
export async function refreshUserFromClerk(
  prisma: PrismaClient,
  clerkUserId: string,
): Promise<User> {
  const clerk = createClerkClient({ secretKey: requireClerkSecretKey() });
  const user = await clerk.users.getUser(clerkUserId);
  return upsertUserFromClerkApiUser(prisma, user);
}

export function displayNameForUser(user: User): string {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length) return parts.join(' ');
  if (user.email) return user.email;
  return 'Member';
}
