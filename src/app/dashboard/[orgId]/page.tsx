import { db } from '@/lib/db'
import { organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ExecutionHistory } from '@/components/features/ExecutionHistory'
import TemplateGallery from '@/components/features/TemplateGallery'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, LayoutGrid, ShieldCheck, Activity, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/tessera'

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

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex justify-between items-start pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">
            {org.name}
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-2">Organization Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={org.planStatus} />
          {!isPro && (
            <Button size="sm" asChild>
              <Link href={`/dashboard/${orgId}/billing`}>Upgrade</Link>
            </Button>
          )}
        </div>
      </header>

      <Card className="p-8 bg-linear-to-br from-indigo-50 to-violet-50 border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">
              Quick Actions
            </p>
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link href={`/dashboard/${orgId}/workflows`}>
                  <Zap className="w-4 h-4" />
                  Create Workflow
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/${orgId}/vault`}>
                  <ShieldCheck className="w-4 h-4" />
                  Add Secret
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            Blueprint Library
          </h2>
        </div>
        <TemplateGallery orgId={orgId} planStatus={org.planStatus} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="w-5 h-5 text-indigo-500" />
                System Activity
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/${orgId}/activity`} className="flex items-center gap-1">
                  View All
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ExecutionHistory logs={[]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Resource Management</CardTitle>
            <CardDescription>
              Access your pipelines and sensitive credentials through dedicated management modules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href={`/dashboard/${orgId}/workflows`}
                className="group flex flex-col gap-3 p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <LayoutGrid className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span className="text-sm font-bold text-slate-700">Workflows</span>
              </Link>
              <Link
                href={`/dashboard/${orgId}/vault`}
                className="group flex flex-col gap-3 p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span className="text-sm font-bold text-slate-700">Security Vault</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
