import { db } from '@/lib/db'
import { organizations, workflows, auditLogs, secrets } from '@/lib/db/schema'
import { eq, desc, count, and, gte } from 'drizzle-orm'
import { ExecutionHistory } from '@/components/features/ExecutionHistory'
import TemplateGallery from '@/components/features/TemplateGallery'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck,
  LayoutGrid,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Plus,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ orgId: string }>
}

export default async function DashboardPage({ params }: PageProps) {
  const { orgId } = await params
  const { userId, orgSlug } = await auth()
  if (!userId) notFound()

  let org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  })

  if (!org) {
    await db
      .insert(organizations)
      .values({
        id: orgId,
        name: orgSlug || 'New Workspace',
        planStatus: 'free',
      })
      .onConflictDoNothing()

    org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    })
  }

  if (!org) notFound()

  const isPro = org.planStatus === 'active' || org.planStatus === 'trialing'
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const [workflowsData, secretsData, recentLogs, last24hLogs, successLogs, failedLogs] =
    await Promise.all([
      db.select({ count: count() }).from(workflows).where(eq(workflows.orgId, orgId)),
      db.select({ count: count() }).from(secrets).where(eq(secrets.orgId, orgId)),
      db.query.auditLogs.findMany({
        where: eq(auditLogs.orgId, orgId),
        orderBy: [desc(auditLogs.timestamp)],
        limit: 10,
      }),
      db
        .select({ count: count() })
        .from(auditLogs)
        .where(and(eq(auditLogs.orgId, orgId), gte(auditLogs.timestamp, last24h))),
      db
        .select({ count: count() })
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.orgId, orgId),
            eq(auditLogs.action, 'EXECUTION_SUCCESS'),
            gte(auditLogs.timestamp, last24h)
          )
        ),
      db
        .select({ count: count() })
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.orgId, orgId),
            eq(auditLogs.action, 'EXECUTION_FAILED'),
            gte(auditLogs.timestamp, last24h)
          )
        ),
    ])

  const workflowCount = workflowsData[0]?.count || 0
  const secretCount = secretsData[0]?.count || 0
  const executions24h = last24hLogs[0]?.count || 0
  const successCount = successLogs[0]?.count || 0
  const failedCount = failedLogs[0]?.count || 0

  const logs = recentLogs.map(log => ({
    id: log.id,
    parentId: log.parentId,
    action: log.action,
    actorId: log.actorId,
    workflowId: log.workflowId,
    timestamp: log.timestamp,
    metadata: log.payload as Record<string, unknown>,
  }))

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{org.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isPro ? 'Pro Plan' : 'Free Plan'} • {workflowCount} workflows
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isPro && (
                <Link
                  href={`/dashboard/${orgId}/billing`}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors rounded"
                >
                  Upgrade
                </Link>
              )}
              <Link
                href={`/dashboard/${orgId}/workflows`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors rounded"
              >
                <Plus className="w-3.5 h-3.5" />
                New Workflow
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/dashboard/${orgId}/workflows`}
            className="bg-white border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all group rounded"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 group-hover:bg-slate-100 transition-colors rounded">
                  <LayoutGrid className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-slate-900">{workflowCount}</div>
                  <div className="text-xs text-slate-500">Workflows</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          <Link
            href={`/dashboard/${orgId}/vault`}
            className="bg-white border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all group rounded"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 group-hover:bg-slate-100 transition-colors rounded">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-slate-900">{secretCount}</div>
                  <div className="text-xs text-slate-500">Secrets</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          <div className="bg-white border border-slate-200 p-4 rounded">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded">
                <TrendingUp className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-slate-900">{executions24h}</div>
                <div className="text-xs text-slate-500">Executions (24h)</div>
              </div>
            </div>
            {executions24h > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 text-xs">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {successCount}
                </span>
                {failedCount > 0 && (
                  <span className="text-red-600 font-medium flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {failedCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Quick Start Templates</h2>
            <TemplateGallery orgId={orgId} planStatus={org.planStatus} />
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
              </div>
              <Link
                href={`/dashboard/${orgId}/activity`}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                View all
              </Link>
            </div>
            <ExecutionHistory logs={logs} />
          </div>
        </div>
      </div>
    </main>
  )
}
