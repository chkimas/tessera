import { db } from '@/lib/db'
import { organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DeploymentButton from '@/components/features/DeploymentButton'
import { Zap, Plus, Search, Filter, ArrowRight } from 'lucide-react'
import { PageHeader, StatusBadge } from '@/components/tessera'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PageProps {
  params: Promise<{ orgId: string }>
}

const statusColorMap = {
  draft: 'from-blue-500 to-sky-500',
  approved: 'from-amber-400 to-amber-600',
  deployed: 'from-emerald-400 to-emerald-600',
  paused: 'from-slate-300 to-slate-400',
}

export default async function WorkflowsPage({ params }: PageProps) {
  const { orgId } = await params
  const { userId } = await auth()
  if (!userId) notFound()

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
    with: {
      workflows: {
        orderBy: (workflows, { desc }) => [desc(workflows.updatedAt)],
      },
    },
  })

  if (!org) notFound()

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Active Pipelines"
        description="Manage and monitor your automated n8n workflows."
        icon={<Zap className="w-6 h-6 fill-indigo-500" />}
        actions={
          <Button>
            <Plus className="w-4 h-4" />
            Create Workflow
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input type="text" placeholder="Search pipelines..." className="pl-11" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-3.5 h-3.5" />
          Filters
        </Button>
      </div>

      <div className="space-y-4">
        {org.workflows.length > 0 ? (
          org.workflows.map(wf => (
            <div
              key={wf.id}
              className="group relative overflow-hidden bg-white shadow-sm hover:shadow-md transition-all"
            >
              <div
                className={`absolute inset-y-0 left-0 w-1 bg-linear-to-b ${statusColorMap[wf.status as keyof typeof statusColorMap] || statusColorMap.draft}`}
              />

              <div className="p-5 pl-6 flex justify-between items-center">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="h-10 w-10 bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors shrink-0">
                    <Zap className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{wf.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <StatusBadge status={wf.status} />
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 font-medium">
                        Updated {new Date(wf.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/${orgId}/workflows/${wf.id}`}>Edit</Link>
                  </Button>
                  <DeploymentButton workflowId={wf.id} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-display">No workflows found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 leading-relaxed font-medium">
              Start by selecting a blueprint from the dashboard or create a custom pipeline from
              scratch.
            </p>
            <Link
              href={`/dashboard/${orgId}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors mt-6"
            >
              Browse Blueprints
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
