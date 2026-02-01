import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { workflows, auditLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const workflowId = searchParams.get('id')
  const systemActor = `SYSTEM_EXECUTION_NODE_${process.env.NODE_ENV}`

  if (!workflowId) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const authHeader = req.headers.get('authorization')
  const expectedToken = process.env.N8N_CALLBACK_SECRET

  if (!expectedToken) {
    console.error('N8N_CALLBACK_SECRET not configured')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${expectedToken}`) {
    console.warn(`Unauthorized execution attempt for workflow ${workflowId}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const workflow = await db.query.workflows.findFirst({
      where: eq(workflows.id, workflowId),
    })

    if (!workflow || workflow.status !== 'deployed') {
      return NextResponse.json({ error: 'Workflow unavailable' }, { status: 404 })
    }

    const body = await req.json()

    const [triggerLog] = await db
      .insert(auditLogs)
      .values({
        orgId: workflow.orgId,
        action: 'EXECUTION_START',
        workflowId: workflow.id,
        actorId: systemActor,
        payload: { input: body },
      })
      .returning({ id: auditLogs.id })

    const n8nUrl = `${process.env.N8N_WEBHOOK_URL}/${workflowId}`
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const result = await response.json()

    await db.insert(auditLogs).values({
      orgId: workflow.orgId,
      parentId: triggerLog.id,
      action: response.ok ? 'EXECUTION_SUCCESS' : 'EXECUTION_FAILED',
      workflowId: workflow.id,
      actorId: systemActor,
      payload: {
        status: response.status,
        output: result,
      },
    })

    return NextResponse.json({ success: response.ok, data: result })
  } catch {
    return NextResponse.json({ error: 'Critical Execution Failure' }, { status: 500 })
  }
}
