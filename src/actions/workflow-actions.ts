'use server'

import { db } from '@/lib/db'
import { workflows, auditLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { n8nClient } from '@/lib/n8n/client'
import { compileSpecToN8n } from '@/core/use-cases/compile-to-n8n'
import { WorkflowSpecification } from '@/core/domain/specification'
import { revalidatePath } from 'next/cache'

interface DeployParams {
  workflowId: string
  userId: string
  userRole: string
}

export async function deployWorkflowAction({ workflowId, userId }: DeployParams) {
  try {
    const workflow = await db.query.workflows.findFirst({
      where: eq(workflows.id, workflowId),
      with: { organization: true },
    })

    if (!workflow) throw new Error('Workflow not found')

    if (workflow.organization.planStatus !== 'active') {
      throw new Error('Deployment locked. Please upgrade to a Pro/Enterprise plan.')
    }

    const rawCompiledData = compileSpecToN8n(
      workflow.specification as WorkflowSpecification,
      workflowId
    )

    const finalCompiledData = {
      ...rawCompiledData,
      settings: {
        executionTimeout: 300,
      },
    }

    const n8nResponse = await n8nClient.deployWorkflow(
      `TESSERA_${workflow.name}`,
      finalCompiledData
    )

    await db.transaction(async tx => {
      await tx
        .update(workflows)
        .set({ status: 'published', updatedAt: new Date() })
        .where(eq(workflows.id, workflowId))

      await tx.insert(auditLogs).values({
        action: 'WORKFLOW_DEPLOYED',
        actorId: userId,
        workflowId: workflowId,
      })
    })

    revalidatePath(`/dashboard/${workflow.orgId}`)
    return { success: true, n8nId: n8nResponse.id }
  } catch (error) {
    console.error('Deployment Action Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deployment error',
    }
  }
}
