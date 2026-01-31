import { db } from '@/lib/db'
import { workflows } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import DeploymentButton from '@/components/features/DeploymentButton'
import { WorkflowSpecification } from '@/core/domain/specification'

export default async function DashboardPage() {
  const allWorkflows = await db.select().from(workflows).orderBy(desc(workflows.updatedAt))

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Control Plane</h1>
        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          Executor: n8n (Connected)
        </div>
      </header>

      <div className="grid gap-6">
        {allWorkflows.map(workflow => (
          <div
            key={workflow.id}
            className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-lg shadow-sm"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{workflow.name}</h2>
              <div className="flex gap-4 mt-1 text-sm text-slate-500">
                <span>Version: {workflow.version}</span>
                <span className="capitalize">
                  Status:
                  <strong
                    className={workflow.status === 'deployed' ? 'text-green-600' : 'text-amber-600'}
                  >
                    {' '}
                    {workflow.status}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <DeploymentButton
                workflowId={workflow.id}
                specification={workflow.specification as WorkflowSpecification}
              />
            </div>
          </div>
        ))}

        {allWorkflows.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
            No workflows found in the Control Plane.
          </div>
        )}
      </div>
    </main>
  )
}
