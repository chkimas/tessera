import { db } from '@/lib/db'
import { organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import BillingStatus from '@/components/features/BillingStatus'
import { ExecutionHistory } from '@/components/features/ExecutionHistory'
import TemplateGallery from '@/components/features/TemplateGallery'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, LayoutGrid, ShieldCheck, Activity } from 'lucide-react'

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

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex justify-between items-center border-b pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{org.name}</h1>
          <p className="text-slate-500 font-medium text-sm">Organization Overview</p>
        </div>
        <BillingStatus status={org.planStatus} />
      </header>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Blueprint Library</h2>
        </div>
        <TemplateGallery orgId={orgId} planStatus={org.planStatus} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              System Activity
            </h2>
            <Link
              href={`/dashboard/${orgId}/activity`}
              className="text-xs font-bold text-indigo-600 flex items-center hover:text-indigo-700 transition-colors"
            >
              VIEW ALL <ArrowRight className="ml-1 w-3 h-3" />
            </Link>
          </div>
          <ExecutionHistory logs={[]} />
        </section>

        <section className="p-8 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-2">
              Resource Management
            </h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Access your pipelines and sensitive credentials through dedicated management modules.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href={`/dashboard/${orgId}/workflows`}
              className="group flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <LayoutGrid className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="text-sm font-bold text-slate-700">Workflows</span>
            </Link>
            <Link
              href={`/dashboard/${orgId}/vault`}
              className="group flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="text-sm font-bold text-slate-700">Security Vault</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
