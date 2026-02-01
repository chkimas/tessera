import { db } from '@/lib/db'
import { organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Zap, Plus } from 'lucide-react'
import { PageHeader } from '@/components/tessera'
import { Button } from '@/components/ui/button'
import WorkflowsList from '@/components/features/WorkflowsList'
import { protectTenant } from '@/lib/auth/tenant-guard'

interface PageProps {
  params: Promise<{ orgId: string }>
}

export default async function WorkflowsPage({ params }: PageProps) {
  const { orgId } = await params
  await protectTenant(orgId)

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
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Active Workflows"
        description="Manage and monitor your automated n8n workflows"
        icon={<Zap className="w-6 h-6 text-indigo-500" />}
        actions={
          <Button asChild>
            <Link href={`/dashboard/${orgId}/workflows/new`}>
              <Plus className="w-4 h-4" />
              Create Workflow
            </Link>
          </Button>
        }
      />

      <WorkflowsList orgId={orgId} workflows={org.workflows} />
    </main>
  )
}
