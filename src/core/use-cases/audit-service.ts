import { db } from '@/lib/db'
import { auditLogs, statusEnum } from '@/lib/db/schema'

type WorkflowStatus = (typeof statusEnum.enumValues)[number]

export const AuditService = {
  async recordEvent(params: {
    workflowId: string
    action: 'CREATE' | 'UPDATE' | 'APPROVE' | 'DEPLOY' | 'PAUSE' | 'RESUME'
    actorId: string
    previousStatus?: WorkflowStatus
    newStatus?: WorkflowStatus
    payload?: Record<string, unknown>
  }) {
    return await db.insert(auditLogs).values({
      workflowId: params.workflowId,
      action: params.action,
      actorId: params.actorId,
      previousStatus: params.previousStatus || null,
      newStatus: params.newStatus || null,
      payload: params.payload || {},
      timestamp: new Date(),
    })
  },
}
