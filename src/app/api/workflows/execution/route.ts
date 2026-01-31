import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auditLogs } from '@/lib/db/schema'

export async function POST(req: NextRequest) {
  try {
    const { workflowId, status, executionId, error } = await req.json()

    await db.insert(auditLogs).values({
      workflowId,
      action: 'EXECUTION_FINISHED',
      actorId: 'system',
      payload: {
        executionId,
        status,
        errorMessage: error || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to record execution' }, { status: 500 })
  }
}
