'use server'

import { db } from '@/lib/db'
import { organizations, workflows } from '@/lib/db/schema'

export async function seedInitialData() {
  const [org] = await db
    .insert(organizations)
    .values({
      name: 'Tessera Labs',
      planStatus: 'active',
      stripeCustomerId: `cus_${Math.random().toString(36).substring(7)}`,
    })
    .returning()

  await db.insert(workflows).values({
    orgId: org.id,
    name: 'Main API Pipeline',
    status: 'draft',
    specification: {
      nodes: [{ id: '1', type: 'TRIGGER', name: 'Webhook', position: { x: 0, y: 0 }, data: {} }],
      edges: [],
      metadata: { expectedTimeout: 30 },
    },
  })

  return org.id
}
