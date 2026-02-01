import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { organizations, users } from '@/lib/db/schema'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env')
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 })
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
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', { status: 400 })
  }

  const eventType = evt.type

  if (eventType === 'organization.created') {
    const { id, name } = evt.data

    await db.insert(organizations).values({
      id: id,
      name: name,
      planStatus: 'free',
    })
  }

  if (eventType === 'organizationMembership.created') {
    const { organization, public_user_data } = evt.data

    if (public_user_data && organization) {
      await db
        .insert(users)
        .values({
          id: public_user_data.user_id,
          orgId: organization.id,
          email: public_user_data.identifier || '',
          role: 'viewer',
        })
        .onConflictDoNothing()
    }
  }

  return new Response('', { status: 200 })
}
