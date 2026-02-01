'use server'

import { db } from '@/lib/db'
import { organizations, workflows } from '@/lib/db/schema'
import { auth } from '@clerk/nextjs/server'
import { eq, count } from 'drizzle-orm'

export async function seedInitialData() {
  const { orgId } = await auth()

  if (!orgId) throw new Error('No active organization found')

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  })

  if (!org) {
    await db
      .insert(organizations)
      .values({
        id: orgId,
        name: 'Default Workspace',
        planStatus: 'free',
      })
      .onConflictDoNothing()
  }

  const existingWorkflows = await db
    .select({ value: count() })
    .from(workflows)
    .where(eq(workflows.orgId, orgId))

  if (existingWorkflows[0].value > 0) {
    return orgId
  }

  await db.insert(workflows).values({
    orgId: orgId,
    name: 'Main API Pipeline',
    status: 'draft',
    specification: {
      version: '1.0.0',
      nodes: [
        {
          id: '1',
          type: 'TRIGGER',
          name: 'Webhook',
          position: { x: 0, y: 0 },
          data: {},
        },
      ],
      edges: [],
      metadata: { expectedTimeout: 30, retries: 3 },
    },
    n8nWorkflowId: 'seed-main-api-pipeline',
    n8nWebhookUrl: `${process.env.N8N_WEBHOOK_URL ?? ''}/seed-main-api-pipeline`,
    parameters: {},
  })

  return orgId
}
