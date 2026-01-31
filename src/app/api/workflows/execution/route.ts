import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { workflows, auditLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const workflowId = searchParams.get('id')

  if (!workflowId) {
    return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })
  }

  try {
    const workflow = await db.query.workflows.findFirst({
      where: eq(workflows.id, workflowId),
    })

    if (!workflow || workflow.status !== 'published') {
      return NextResponse.json({ error: 'Workflow not found or inactive' }, { status: 404 })
    }

    const payload = await req.json()

    await db.insert(auditLogs).values({
      action: 'WORKFLOW_EXECUTED',
      workflowId: workflow.id,
      actorId: '00000000-0000-0000-0000-000000000000',
    })

    const n8nUrl = `${process.env.N8N_WEBHOOK_URL}/${workflowId}`
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Execution failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
