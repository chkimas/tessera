'use server'

import { db } from '@/lib/db'
import { workflows, auditLogs, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { n8nClient } from '@/lib/n8n/client'
import { compileSpecToN8n } from '@/core/use-cases/compile-to-n8n'
import { canUserDeploy } from '@/core/domain/entitlements'
import { WorkflowSpecification } from '@/core/domain/specification'
import { revalidatePath } from 'next/cache'

interface DeployResponse {
  success: boolean
  n8nId?: string
  error?: string
}

export async function deployWorkflowAction(workflowId: string): Promise<DeployResponse> {
  try {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) throw new Error('Authentication required')

    const [workflow, userRecord] = await Promise.all([
      db.query.workflows.findFirst({
        where: and(eq(workflows.id, workflowId), eq(workflows.orgId, orgId)),
        with: { organization: true },
      }),
      db.query.users.findFirst({
        where: and(eq(users.id, userId), eq(users.orgId, orgId)),
      }),
    ])

    if (!workflow) throw new Error('Workflow not found')
    if (!userRecord) throw new Error('User profile not synchronized')

    const { allowed, reason } = canUserDeploy(userRecord.role, workflow.organization.planStatus)
    if (!allowed) throw new Error(reason)

    const compiledData = compileSpecToN8n(
      workflow.specification as WorkflowSpecification,
      workflowId
    )

    const n8nResponse = await n8nClient.deployWorkflow(
      `TESSERA_${workflow.name.replace(/\s+/g, '_')}`,
      compiledData
    )

    await db.transaction(async tx => {
      await tx
        .update(workflows)
        .set({
          status: 'deployed',
          updatedAt: new Date(),
          version: workflow.version + 1,
        })
        .where(eq(workflows.id, workflowId))

      await tx.insert(auditLogs).values({
        action: 'WORKFLOW_DEPLOYED',
        actorId: userId,
        workflowId: workflowId,
        payload: { n8nId: n8nResponse.id },
      })
    })

    revalidatePath(`/dashboard/${orgId}`)
    return { success: true, n8nId: n8nResponse.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deployment failed',
    }
  }
}
