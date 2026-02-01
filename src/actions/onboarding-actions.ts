'use server'

import { db } from '@/lib/db'
import { organizations, workflows } from '@/lib/db/schema'
import { auth } from '@clerk/nextjs/server'

export async function seedInitialData() {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error('No active organization found in session')
  }

  const [org] = await db
    .insert(organizations)
    .values({
      id: orgId,
      name: 'Default Workspace',
      planStatus: 'active',
      stripeCustomerId: `cus_${Math.random().toString(36).substring(7)}`,
    })
    .onConflictDoUpdate({
      target: organizations.id,
      set: { updatedAt: new Date() },
    })
    .returning()

  await db.insert(workflows).values({
    orgId: org.id,
    name: 'Main API Pipeline',
    status: 'draft',
    specification: {
      version: '1.0.0',
      nodes: [{ id: '1', type: 'TRIGGER', name: 'Webhook', position: { x: 0, y: 0 }, data: {} }],
      edges: [],
      metadata: { expectedTimeout: 30, retries: 3 },
    },
  })

  return org.id
}
