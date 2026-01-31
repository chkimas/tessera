import { db } from '@/lib/db'
import { organizations, secrets, auditLogs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import SecretsForm from '@/components/features/SecretsForm'
import SecretsList from '@/components/features/SecretsList'
import DeploymentButton from '@/components/features/DeploymentButton'
import BillingStatus from '@/components/features/BillingStatus'
import { ExecutionHistory, LogEntry, LogMetadata } from '@/components/features/ExecutionHistory'
import TemplateGallery from '@/components/features/TemplateGallery'
import { WorkflowSpecification } from '@/core/domain/specification'
import { protectTenant } from '@/lib/auth/tenant-guard'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ orgId: string }>
}

export default async function DashboardPage({ params }: PageProps) {
  const { orgId } = await params
  const { orgId: verifiedOrgId } = await protectTenant(orgId)

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, verifiedOrgId),
    with: { workflows: true },
  })

  if (!org) notFound()

  const orgSecrets = await db.query.secrets.findMany({
    where: eq(secrets.orgId, verifiedOrgId),
  })

  const rawLogs = await db.query.auditLogs.findMany({
    where: eq(auditLogs.workflowId, org.workflows[0]?.id || ''),
    orderBy: [desc(auditLogs.timestamp)],
    limit: 5,
  })

  const formattedLogs: LogEntry[] = rawLogs.map(log => ({
    id: log.id,
    action: log.action,
    workflowId: log.workflowId,
    timestamp: log.timestamp,
    metadata: (log.payload as LogMetadata) || {},
  }))

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{org.name}</h1>
          <p className="text-slate-500 font-medium">Control Plane Dashboard</p>
        </div>
        <BillingStatus plan="Pro" status={org.planStatus} />
      </header>

      <TemplateGallery orgId={verifiedOrgId} planStatus={org.planStatus ?? 'inactive'} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 tracking-tight">
              Active Pipelines
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {org.workflows.map(wf => (
                <div
                  key={wf.id}
                  className="p-4 border border-slate-200 rounded-xl bg-white flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <h3 className="font-semibold text-slate-700">{wf.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        ID: {wf.id.slice(0, 8)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-xs text-indigo-600 font-medium">{wf.status}</span>
                    </div>
                  </div>
                  <DeploymentButton
                    workflowId={wf.id}
                    specification={wf.specification as WorkflowSpecification}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 tracking-tight">
              System Activity
            </h2>
            <ExecutionHistory logs={formattedLogs} />
          </section>
        </div>

        <aside className="space-y-6">
          <SecretsForm orgId={verifiedOrgId} />
          <SecretsList secrets={orgSecrets} />
        </aside>
      </div>
    </div>
  )
}
