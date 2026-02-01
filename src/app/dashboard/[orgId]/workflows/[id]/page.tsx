import { db } from '@/lib/db'
import { workflows, auditLogs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'

export default async function WorkflowDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1)

  if (!workflow) notFound()

  const history = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.workflowId, id))
    .orderBy(desc(auditLogs.timestamp))

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900">{workflow.name}</h1>
        <p className="text-slate-500 mt-2">ID: {workflow.id}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Active Specification
          </h3>
          <pre className="p-4 bg-slate-50 border border-slate-200 rounded-lg overflow-auto text-xs font-mono">
            {JSON.stringify(workflow.specification, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Audit Trail
          </h3>
          <div className="space-y-4">
            {history.map(log => (
              <div key={log.id} className="p-3 border-l-2 border-slate-200 bg-white">
                <div className="text-xs font-bold text-slate-800">{log.action}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">By: {log.actorId}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
