'use server'

import { db } from '@/lib/db'
import { workflows, auditLogs } from '@/lib/db/schema'
import { n8nClient } from '@/lib/n8n/client'
import { compileSpecToN8n } from '@/core/use-cases/compile-to-n8n'
import { WorkflowSpecification } from '@/core/domain/specification'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function deployWorkflowAction(workflowId: string, spec: WorkflowSpecification) {
  try {
    await db
      .update(workflows)
      .set({
        specification: spec,
        status: 'approved',
        updatedAt: new Date(),
      })
      .where(eq(workflows.id, workflowId))

    const compiledData = compileSpecToN8n(spec)
    const n8nResult = await n8nClient.deployWorkflow(workflowId, compiledData)

    await db.update(workflows).set({ status: 'deployed' }).where(eq(workflows.id, workflowId))

    await db.insert(auditLogs).values({
      workflowId,
      action: 'DEPLOY',
      actorId: 'system-user',
      newStatus: 'deployed',
      payload: { n8nId: n8nResult.id },
    })

    revalidatePath('/workflows')
    return { success: true }
  } catch (error) {
    console.error('Deployment Orchestration Failed:', error)
    return { success: false, error: 'Deployment Failed' }
  }
}
