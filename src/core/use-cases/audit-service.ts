import { db } from '@/lib/db'
import { auditLogs } from '@/lib/db/schema'

export const AuditService = {
  async recordEvent(params: {
    workflowId: string
    action: 'CREATE' | 'UPDATE' | 'APPROVE' | 'DEPLOY' | 'PAUSE' | 'RESUME'
    actorId: string
    parentId?: string
    previousStatus?: string
    newStatus?: string
    payload?: Record<string, unknown>
  }) {
    return await db.insert(auditLogs).values({
      workflowId: params.workflowId,
      action: params.action,
      actorId: params.actorId,
      parentId: params.parentId || null,
      payload: {
        ...params.payload,
        previousStatus: params.previousStatus,
        newStatus: params.newStatus,
      },
    })
  },
}
