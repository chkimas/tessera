import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { organizations, users } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET')
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch {
    return new Response('Error: Verification failed', { status: 400 })
  }

  const eventType = evt.type

  // 1. Handle Organization Creation
  if (eventType === 'organization.created') {
    const { id, name } = evt.data
    await db
      .insert(organizations)
      .values({
        id,
        name,
        planStatus: 'free',
      })
      .onConflictDoUpdate({
        target: organizations.id,
        set: { name },
      })
  }

  // 2. Handle User Membership (The logic that was failing)
  if (eventType === 'organizationMembership.created') {
    const { organization, public_user_data } = evt.data
    if (public_user_data && organization) {
      // Check if any members exist to determine if this is the first (Admin)
      const existingMembers = await db
        .select({ value: count() })
        .from(users)
        .where(eq(users.orgId, organization.id))

      const isFirstMember = existingMembers[0].value === 0

      await db
        .insert(users)
        .values({
          id: public_user_data.user_id,
          orgId: organization.id,
          email: public_user_data.identifier || '',
          role: isFirstMember ? 'admin' : 'viewer',
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            orgId: organization.id,
            role: isFirstMember ? 'admin' : 'viewer',
          },
        })
    }
  }

  // 3. Handle Initial User Creation (Fallback)
  if (eventType === 'user.created') {
    const { id, email_addresses, primary_email_address_id } = evt.data
    const primaryEmail = email_addresses?.find(
      (email: { id: string; email_address: string }) => email.id === primary_email_address_id
    )

    if (primaryEmail) {
      await db
        .insert(users)
        .values({
          id,
          email: primaryEmail.email_address,
          role: 'viewer',
        })
        .onConflictDoUpdate({
          target: users.id,
          set: { email: primaryEmail.email_address },
        })
    }
  }

  return new Response('Webhook processed', { status: 200 })
}
