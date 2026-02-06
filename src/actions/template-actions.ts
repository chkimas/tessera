'use server'

import { db } from '@/lib/db'
import { workflows } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { compileSpecToN8n } from '@/core/use-cases/compile-to-n8n'
import { n8nClient } from '@/lib/n8n/client'
import { auth } from '@clerk/nextjs/server'
import { WorkflowSpecification } from '@/core/domain/specification'

const BLUEPRINTS: Record<string, WorkflowSpecification> = {
  'webhook-relay': {
    version: '1.0.0',
    nodes: [
      {
        id: '1',
        type: 'TRIGGER',
        name: 'Universal Webhook',
        position: { x: 100, y: 150 },
        data: { type: 'WEBHOOK', path: 'relay-in', method: 'POST' },
      },
      {
        id: '2',
        type: 'ACTION',
        name: 'Slack Post',
        position: { x: 400, y: 150 },
        data: {
          type: 'HTTP_REQUEST',
          method: 'POST',
          url: 'https://slack.com/api/chat.postMessage',
        },
      },
    ],
    edges: [{ id: 'e1-2', source: '1', target: '2' }],
    metadata: { expectedTimeout: 5, retries: 1 },
  },
  'github-sync': {
    version: '1.0.0',
    nodes: [
      {
        id: '1',
        type: 'TRIGGER',
        name: 'GitHub Issue Webhook',
        position: { x: 50, y: 100 },
        data: { type: 'WEBHOOK', path: 'github-in', method: 'POST' },
      },
      {
        id: '2',
        type: 'ACTION',
        name: 'Notion Sync',
        position: { x: 350, y: 100 },
        data: { type: 'HTTP_REQUEST', method: 'POST', url: 'https://api.notion.com/v1/pages' },
      },
    ],
    edges: [{ id: 'e1-2', source: '1', target: '2' }],
    metadata: { expectedTimeout: 10, retries: 3 },
  },
  'ai-lead-intel': {
    version: '1.0.0',
    nodes: [
      {
        id: '1',
        type: 'TRIGGER',
        name: 'Lead Form Catch',
        position: { x: 0, y: 200 },
        data: { type: 'WEBHOOK', path: 'lead-in', method: 'POST' },
      },
      {
        id: '2',
        type: 'ACTION',
        name: 'AI Researcher',
        position: { x: 250, y: 200 },
        data: {
          type: 'HTTP_REQUEST',
          method: 'POST',
          url: 'https://api.openai.com/v1/chat/completions',
        },
      },
      {
        id: '3',
        type: 'ACTION',
        name: 'Email Draft',
        position: { x: 500, y: 200 },
        data: {
          type: 'HTTP_REQUEST',
          method: 'POST',
          url: 'https://gmail.googleapis.com/upload/gmail/v1/users/me/drafts',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    metadata: { expectedTimeout: 120, retries: 2 },
  },
  'social-ghostwriter': {
    version: '1.0.0',
    nodes: [
      {
        id: '1',
        type: 'TRIGGER',
        name: 'RSS Feed',
        position: { x: 100, y: 50 },
        data: { type: 'SCHEDULE', cron: '0 * * * *' },
      },
      {
        id: '2',
        type: 'ACTION',
        name: 'AI Transmuter',
        position: { x: 400, y: 50 },
        data: {
          type: 'HTTP_REQUEST',
          method: 'POST',
          url: 'https://api.anthropic.com/v1/messages',
        },
      },
      {
        id: '3',
        type: 'ACTION',
        name: 'Buffer Post',
        position: { x: 700, y: 50 },
        data: {
          type: 'HTTP_REQUEST',
          method: 'POST',
          url: 'https://api.bufferapp.com/1/updates/create.json',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    metadata: { expectedTimeout: 90, retries: 1 },
  },
  'revenue-guard': {
    version: '1.0.0',
    nodes: [
      {
        id: '1',
        type: 'TRIGGER',
        name: 'Stripe Failed Charge',
        position: { x: 100, y: 150 },
        data: { type: 'WEBHOOK', path: 'stripe-fail', method: 'POST' },
      },
      {
        id: '2',
        type: 'ACTION',
        name: 'HubSpot Lookup',
        position: { x: 350, y: 150 },
        data: {
          type: 'HTTP_REQUEST',
          method: 'GET',
          url: 'https://api.hubapi.com/crm/v3/objects/contacts',
        },
      },
      {
        id: '3',
        type: 'ACTION',
        name: 'Slack Alert',
        position: { x: 600, y: 150 },
        data: {
          type: 'HTTP_REQUEST',
          method: 'POST',
          url: 'https://slack.com/api/chat.postMessage',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    metadata: { expectedTimeout: 30, retries: 5 },
  },
  'devops-remedy': {
    version: '1.0.0',
    nodes: [
      {
        id: '1',
        type: 'TRIGGER',
        name: 'Error Monitor',
        position: { x: 50, y: 100 },
        data: { type: 'WEBHOOK', path: 'monitor-in', method: 'POST' },
      },
      {
        id: '2',
        type: 'ACTION',
        name: 'Remedy Script',
        position: { x: 300, y: 100 },
        data: {
          type: 'HTTP_REQUEST',
          method: 'POST',
          url: 'https://api.digitalocean.com/v2/droplets/actions',
        },
      },
      {
        id: '3',
        type: 'ACTION',
        name: 'Incident Report',
        position: { x: 550, y: 100 },
        data: { type: 'HTTP_REQUEST', method: 'POST', url: 'https://api.pagerduty.com/incidents' },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    metadata: { expectedTimeout: 300, retries: 0 },
  },
  'github-slack': {
    version: '1.0.0',
    nodes: [
      {
        id: '1',
        type: 'TRIGGER',
        name: 'Cron (15min)',
        position: { x: 100, y: 150 },
        data: { type: 'SCHEDULE', cron: '*/15 * * * *' },
      },
      {
        id: '2',
        type: 'ACTION',
        name: 'GitHub Issues',
        position: { x: 400, y: 150 },
        data: {
          type: 'HTTP_REQUEST',
          method: 'GET',
          url: 'https://api.github.com/repos/{{$vars.REPO_OWNER}}/{{$vars.REPO_NAME}}/issues',
        },
      },
      {
        id: '3',
        type: 'ACTION',
        name: 'Slack Notify',
        position: { x: 700, y: 150 },
        data: {
          type: 'HTTP_REQUEST',
          method: 'POST',
          url: '{{$vars.SLACK_WEBHOOK}}',
          body: { text: 'New Issue: {{$json[0].title}}' },
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    metadata: { expectedTimeout: 30, retries: 2 },
    parameters: [
      { key: 'GITHUB_TOKEN', label: 'GitHub Token', type: 'secret', required: true },
      { key: 'REPO_OWNER', label: 'Repo Owner', type: 'text', required: true },
      { key: 'REPO_NAME', label: 'Repo Name', type: 'text', required: true },
      { key: 'SLACK_WEBHOOK', label: 'Slack Webhook', type: 'secret', required: true },
    ],
  },
}

export async function createFromTemplateAction(
  orgId: string,
  templateId: string,
  parameters?: Record<string, string>
) {
  const { userId, orgId: sessionOrgId } = await auth()
  if (!userId || !sessionOrgId || orgId !== sessionOrgId) throw new Error('Access denied')

  const blueprint = BLUEPRINTS[templateId]
  if (!blueprint) throw new Error('Template not found')

  const compiled = compileSpecToN8n(blueprint, `tessera-${templateId}-${Date.now()}`)
  const workflowDisplayName = `${templateId.replace(/-/g, ' ').toUpperCase()} (${orgId.slice(-4)})`
  const n8nDeployment = await n8nClient.deployWorkflow(workflowDisplayName, {
    ...compiled,
    staticData: parameters || null,
  })

  await n8nClient.activateWorkflow(n8nDeployment.id)
  await new Promise(resolve => setTimeout(resolve, 2000))

  const webhookTriggerNode = blueprint.nodes.find(
    node => node.data && typeof node.data === 'object' && 'path' in node.data
  )
  const webhookPath = (webhookTriggerNode?.data as { path?: string })?.path || null

  const n8nWebhookUrl = webhookPath
    ? `${process.env.N8N_WEBHOOK_URL}/webhook/${n8nDeployment.id}/${webhookPath}`
    : null

  const [workflow] = await db
    .insert(workflows)
    .values({
      orgId,
      name: templateId.replace(/-/g, ' ').toUpperCase(),
      status: 'deployed',
      specification: blueprint,
      n8nWorkflowId: n8nDeployment.id,
      n8nWebhookUrl,
      parameters: parameters || {},
    })
    .returning()

  revalidatePath(`/dashboard/${orgId}/workflows`)
  return workflow
}
