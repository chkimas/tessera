import { db } from '@/lib/db'
import { organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import DeploymentButton from '@/components/features/DeploymentButton'
import { Zap, Plus, Search, Filter } from 'lucide-react'

interface PageProps {
  params: Promise<{ orgId: string }>
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
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Zap className="w-6 h-6 text-indigo-500 fill-indigo-500" />
            Active Pipelines
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage and monitor your automated n8n workflows.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" />
          Create Workflow
        </button>
      </header>

      <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pipelines..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm pl-10 placeholder:text-slate-400 font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter className="w-3.5 h-3.5" />
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {org.workflows.length > 0 ? (
          org.workflows.map(wf => (
            <div
              key={wf.id}
              className="group p-5 border border-slate-200 rounded-2xl bg-white flex justify-between items-center hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                  <Zap className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 tracking-tight">{wf.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {wf.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Updated {new Date(wf.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                  Edit Nodes
                </button>
                <DeploymentButton workflowId={wf.id} />
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No workflows found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
              Start by selecting a blueprint from the dashboard or create a custom pipeline from
              scratch.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
