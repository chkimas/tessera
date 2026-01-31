'use server'

import { db } from '@/lib/db'
import { workflows, auditLogs } from '@/lib/db/schema'
import { n8nClient } from '@/lib/n8n/client'
import { compileSpecToN8n } from '@/core/use-cases/compile-to-n8n'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { WorkflowSpecification } from '@/core/domain/specification'

const DeploySchema = z.object({
  workflowId: z.string().uuid(),
  userId: z.string().uuid(),
  userRole: z.enum(['viewer', 'developer', 'approver', 'admin']),
})

export async function deployWorkflowAction(formData: unknown) {
  try {
    const { workflowId, userId, userRole } = DeploySchema.parse(formData)

    const workflow = await db.query.workflows.findFirst({
      where: eq(workflows.id, workflowId),
      with: { organization: true },
    })

    if (!workflow) throw new Error('Workflow not found')
    if (userRole !== 'admin') {
      throw new Error('Permission Denied: Admin role required for deployment')
    }
    if (workflow.organization.planStatus !== 'active') {
      throw new Error('Commercial Restriction: Active Stripe subscription required')
    }

    const n8nResult = await db.transaction(async tx => {
      await tx
        .update(workflows)
        .set({ status: 'approved', updatedAt: new Date() })
        .where(eq(workflows.id, workflowId))

      const compiledData = compileSpecToN8n(workflow.specification as WorkflowSpecification)
      const result = await n8nClient.deployWorkflow(workflow.name, compiledData)

      await tx
        .update(workflows)
        .set({ status: 'deployed', updatedAt: new Date() })
        .where(eq(workflows.id, workflowId))

      await tx.insert(auditLogs).values({
        workflowId,
        action: 'DEPLOY',
        actorId: userId,
        newStatus: 'deployed',
        payload: { n8nId: result.id },
      })

      return result
    })

    revalidatePath('/')
    revalidatePath(`/workflows/${workflowId}`)

    return { success: true, n8nId: n8nResult.id }
  } catch (error) {
    console.error('Deployment Failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deployment error',
    }
  }
}
