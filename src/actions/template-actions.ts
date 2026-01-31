'use server'

import { db } from '@/lib/db'
import { workflows } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { WorkflowSpecification } from '@/core/domain/specification'

const BLUEPRINTS: Record<string, WorkflowSpecification> = {
  'slack-notif': {
    version: '1.0.0',
    nodes: [
      {
        id: '1',
        type: 'TRIGGER',
        name: 'Webhook',
        position: { x: 100, y: 100 },
        data: { path: 'internal-slack-trigger' },
      },
      {
        id: '2',
        type: 'ACTION',
        name: 'Slack Bot',
        position: { x: 400, y: 100 },
        data: { channel: '#general' },
      },
    ],
    edges: [{ id: 'e1-2', source: '1', target: '2' }],
    metadata: {
      expectedTimeout: 10,
      retries: 3,
    },
  },
  'ai-lead-analyzer': {
    version: '1.0.0',
    nodes: [
      { id: '1', type: 'TRIGGER', name: 'Lead Webhook', position: { x: 50, y: 100 }, data: {} },
      {
        id: '2',
        type: 'ACTION',
        name: 'OpenAI Researcher',
        position: { x: 300, y: 100 },
        data: { model: 'gpt-4o' },
      },
      { id: '3', type: 'ACTION', name: 'Slack Post', position: { x: 550, y: 100 }, data: {} },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    metadata: {
      expectedTimeout: 60,
      retries: 2,
    },
  },
}

export async function createFromTemplateAction(orgId: string, templateId: string) {
  const blueprint = BLUEPRINTS[templateId]

  if (!blueprint) throw new Error('Template not found')

  const [newWorkflow] = await db
    .insert(workflows)
    .values({
      orgId,
      name: `My ${templateId.replace('-', ' ')}`,
      status: 'draft',
      specification: blueprint,
    })
    .returning()

  revalidatePath(`/dashboard/${orgId}`)
  return newWorkflow.id
}
