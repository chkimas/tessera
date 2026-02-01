import { db } from '@/lib/db'
import { auditLogs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { ExecutionHistory } from '@/components/features/ExecutionHistory'
import { Activity, Download } from 'lucide-react'

interface PageProps {
  params: Promise<{ orgId: string }>
}

export default async function ActivityPage({ params }: PageProps) {
  const { orgId } = await params
  const { userId } = await auth()
  if (!userId) notFound()

  const rawLogs = await db.query.auditLogs.findMany({
    where: eq(auditLogs.orgId, orgId),
    orderBy: [desc(auditLogs.timestamp)],
    limit: 50,
  })

  const logs = rawLogs.map(log => ({
    id: log.id,
    action: log.action,
    actorId: log.actorId,
    workflowId: log.workflowId,
    timestamp: log.timestamp,
    metadata: log.payload as Record<string, unknown>,
  }))

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Activity className="w-6 h-6 text-indigo-500" />
            System Activity
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time execution logs and audit history for all organization pipelines.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800">Execution History</h2>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Monitoring
          </span>
        </div>
        <ExecutionHistory logs={logs} />
      </section>
    </main>
  )
}
