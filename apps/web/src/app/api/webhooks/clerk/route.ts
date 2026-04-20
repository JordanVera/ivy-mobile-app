import {
  deleteUserByClerkId,
  upsertUserFromClerkUserJSON,
} from '@ivy/api';
import { prisma } from '@ivy/database';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      await upsertUserFromClerkUserJSON(prisma, evt.data);
    } else if (evt.type === 'user.deleted') {
      const id = evt.data.id;
      if (id) await deleteUserByClerkId(prisma, id);
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Clerk webhook error:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }
}
