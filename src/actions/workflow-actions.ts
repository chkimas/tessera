'use server'

import { db } from '@/lib/db'
import { workflows } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { n8nClient } from '@/lib/n8n/client'
import { compileSpecToN8n } from '@/core/use-cases/compile-to-n8n'
import { WorkflowSpecification } from '@/core/domain/specification'
import { revalidatePath } from 'next/cache'

interface N8nWorkflow {
  id: string
  nodes: Array<{
    type: string
    parameters: { path?: string }
  }>
  webhookUrl?: string
}

export async function testWorkflowAction(webhookUrl: string, workflowId: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test-trigger',
          workflowId,
          timestamp: Date.now(),
          data: { message: 'Tessera test payload' },
        }),
      })

      if (response.status === 404 && i < retries - 1) {
        await new Promise(res => setTimeout(res, 4000 + i * 2000))
        continue
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`n8n responded with ${response.status}: ${errorText}`)
      }

      return { success: true }
    } catch (error) {
      if (i === retries - 1) throw error
    }
  }
}

export async function deleteWorkflowAction(orgId: string, workflowId: string) {
  const { userId, orgId: sessionOrgId } = await auth()
  if (!userId || !sessionOrgId || orgId !== sessionOrgId) throw new Error('Access denied')

  const [workflow] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.id, workflowId), eq(workflows.orgId, orgId)))
    .limit(1)

  if (!workflow) throw new Error('Workflow not found')

  if (workflow.n8nWorkflowId) {
    try {
      await n8nClient.deleteWorkflow(workflow.n8nWorkflowId)
    } catch {
      console.warn('n8n cleanup failed; proceeding with removal')
    }
  }

  await db.delete(workflows).where(and(eq(workflows.id, workflowId), eq(workflows.orgId, orgId)))
  revalidatePath(`/dashboard/${orgId}/workflows`)
}

export async function deployWorkflowAction(workflowId: string) {
  try {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) throw new Error('Authentication required')

    const workflow = await db.query.workflows.findFirst({
      where: and(eq(workflows.id, workflowId), eq(workflows.orgId, orgId)),
      with: { organization: true },
    })

    if (!workflow) throw new Error('Workflow not found')

    const compiledData = compileSpecToN8n(
      workflow.specification as WorkflowSpecification,
      workflowId
    )

    const n8nResponse = await n8nClient.deployWorkflow(
      `TESSERA_${workflow.name.replace(/\s+/g, '_')}`,
      compiledData
    )

    await n8nClient.activateWorkflow(n8nResponse.id)
    const workflowData: N8nWorkflow = await n8nClient.getWorkflow(n8nResponse.id)

    let webhookUrl: string | null = null
    const webhookNode = workflowData.nodes?.find(
      (n: { type: string; parameters: { path?: string } }) => n.type === 'n8n-nodes-base.webhook'
    )
    const path = webhookNode?.parameters?.path || workflowId
    webhookUrl = `${process.env.N8N_WEBHOOK_URL}/webhook/${n8nResponse.id}/${path}`

    await n8nClient.deactivateWorkflow(n8nResponse.id)
    await new Promise(r => setTimeout(r, 1500))
    await n8nClient.activateWorkflow(n8nResponse.id)

    await db
      .update(workflows)
      .set({
        status: 'deployed',
        updatedAt: new Date(),
        n8nWorkflowId: n8nResponse.id,
        n8nWebhookUrl: webhookUrl,
        version: workflow.version + 1,
      })
      .where(eq(workflows.id, workflowId))

    revalidatePath(`/dashboard/${orgId}/workflows`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deployment failed',
    }
  }
}
