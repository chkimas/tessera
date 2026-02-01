import { db } from '@/lib/db'
import { workflows, auditLogs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/tessera'
import { Workflow, History, Code2 } from 'lucide-react'

export default async function WorkflowDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1)

  if (!workflow) notFound()

  const history = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.workflowId, id))
    .orderBy(desc(auditLogs.timestamp))
    .limit(20)

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title={workflow.name}
        description={`Workflow ID: ${workflow.id}`}
        icon={<Workflow className="w-6 h-6" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Specification
            </h2>
          </div>
          <div className="p-6">
            <pre className="p-4 bg-slate-50 border border-slate-200 overflow-auto text-xs font-mono leading-relaxed max-h-150">
              {JSON.stringify(workflow.specification, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <History className="w-4 h-4" />
              Audit Trail
            </h2>
            <span className="text-xs font-bold text-slate-500">{history.length}</span>
          </div>
          <div className="divide-y divide-slate-200">
            {history.length === 0 ? (
              <div className="py-12 text-center">
                <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No audit logs</p>
              </div>
            ) : (
              history.map(log => (
                <div key={log.id} className="px-6 py-4 border-l-2 border-slate-300">
                  <p className="text-sm font-bold text-slate-900">{log.action}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Actor: {log.actorId}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
