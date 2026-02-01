'use server'

import { db } from '@/lib/db'
import { workflows } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { WorkflowSpecification } from '@/core/domain/specification'
import { auth } from '@clerk/nextjs/server'

const BLUEPRINTS: Record<string, WorkflowSpecification> = {
  'webhook-relay': {
    version: '1.0.0',
    nodes: [
      {
        id: '1',
        type: 'TRIGGER',
        name: 'Universal Webhook',
        position: { x: 100, y: 150 },
        data: { path: 'relay-in' },
      },
      {
        id: '2',
        type: 'ACTION',
        name: 'Slack Post',
        position: { x: 400, y: 150 },
        data: { channel: '#alerts' },
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
        data: {},
      },
      {
        id: '2',
        type: 'ACTION',
        name: 'Notion Sync',
        position: { x: 350, y: 100 },
        data: { databaseId: 'PENDING' },
      },
    ],
    edges: [{ id: 'e1-2', source: '1', target: '2' }],
    metadata: { expectedTimeout: 10, retries: 3 },
  },
  'ai-lead-intel': {
    version: '1.0.0',
    nodes: [
      { id: '1', type: 'TRIGGER', name: 'Lead Form Catch', position: { x: 0, y: 200 }, data: {} },
      {
        id: '2',
        type: 'ACTION',
        name: 'AI Researcher Agent',
        position: { x: 250, y: 200 },
        data: { model: 'gpt-4o', prompt: 'Analyze lead website' },
      },
      {
        id: '3',
        type: 'ACTION',
        name: 'Email Draft',
        position: { x: 500, y: 200 },
        data: { service: 'gmail' },
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
      { id: '1', type: 'TRIGGER', name: 'RSS/YouTube Feed', position: { x: 100, y: 50 }, data: {} },
      {
        id: '2',
        type: 'ACTION',
        name: 'AI Content Transmuter',
        position: { x: 400, y: 50 },
        data: { target: 'X/LinkedIn' },
      },
      { id: '3', type: 'ACTION', name: 'Buffer Schedule', position: { x: 700, y: 50 }, data: {} },
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
        data: {},
      },
      { id: '2', type: 'ACTION', name: 'HubSpot Lookup', position: { x: 350, y: 150 }, data: {} },
      { id: '3', type: 'ACTION', name: 'Slack DM to AE', position: { x: 600, y: 150 }, data: {} },
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
        name: 'HTTP Error Monitor',
        position: { x: 50, y: 100 },
        data: { statusCodes: [500, 502, 504] },
      },
      {
        id: '2',
        type: 'ACTION',
        name: 'SSH Script Executor',
        position: { x: 300, y: 100 },
        data: { script: 'systemctl restart service' },
      },
      { id: '3', type: 'ACTION', name: 'Incident Report', position: { x: 550, y: 100 }, data: {} },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    metadata: { expectedTimeout: 300, retries: 0 },
  },
}

export async function createFromTemplateAction(orgId: string, templateId: string) {
  const { userId, orgId: sessionOrgId } = await auth()

  if (!userId || !sessionOrgId) {
    throw new Error('Authentication required')
  }

  if (orgId !== sessionOrgId) {
    throw new Error('Access denied: Organization mismatch')
  }

  const blueprint = BLUEPRINTS[templateId]

  if (!blueprint) throw new Error('Template not found')

  const [newWorkflow] = await db
    .insert(workflows)
    .values({
      orgId,
      name: `${templateId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')} Blueprint`,
      status: 'draft',
      specification: blueprint,
    })
    .returning()

  revalidatePath(`/dashboard/${orgId}/workflows`)
  return newWorkflow.id
}
