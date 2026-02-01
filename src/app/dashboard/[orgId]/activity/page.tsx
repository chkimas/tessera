import { db } from '@/lib/db'
import { auditLogs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { ExecutionHistory } from '@/components/features/ExecutionHistory'
import { Activity, Download } from 'lucide-react'
import { PageHeader } from '@/components/tessera'
import { Button } from '@/components/ui/button'

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
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="System Activity"
        description="Real-time execution logs and audit history for all organization pipelines"
        icon={<Activity className="w-6 h-6 text-indigo-500" />}
        actions={
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        }
      />

      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-slate-900">Execution History</h2>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-600">Live</span>
          </div>
        </div>
        <ExecutionHistory logs={logs} />
      </div>
    </main>
  )
}
