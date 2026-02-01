import { db } from '@/lib/db'
import { secrets } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import SecretsForm from '@/components/features/SecretsForm'
import SecretsList from '@/components/features/SecretsList'
import { ShieldCheck, Lock } from 'lucide-react'
import { PageHeader } from '@/components/tessera'
import { protectTenant } from '@/lib/auth/tenant-guard'

interface PageProps {
  params: Promise<{ orgId: string }>
}

export default async function VaultPage({ params }: PageProps) {
  const { orgId } = await params
  await protectTenant(orgId)

  const orgSecrets = await db.query.secrets.findMany({
    where: eq(secrets.orgId, orgId),
    columns: {
      id: true,
      keyName: true,
      createdAt: true,
    },
    orderBy: [desc(secrets.createdAt)],
  })

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Security Vault"
        description="Securely manage API keys and environment variables for your n8n nodes"
        icon={<ShieldCheck className="w-6 h-6 text-indigo-500" />}
        actions={
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded text-xs font-medium text-emerald-700">
            <Lock className="w-3.5 h-3.5" />
            AES-256 Encrypted
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Add Secret</h2>
            <SecretsForm />
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 leading-relaxed">
            <p className="mb-2">
              <strong className="text-slate-900">Encrypted at rest.</strong> Raw values cannot be
              retrieved after saving, only overwritten or deleted.
            </p>
            <p>
              <strong className="text-slate-900">Best practices:</strong> Rotate regularly, use
              unique keys per environment, never commit to git.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-900">Stored Secrets</h2>
            <span className="text-xs font-medium text-slate-500">{orgSecrets.length}</span>
          </div>
          <SecretsList secrets={orgSecrets} />
        </div>
      </div>
    </main>
  )
}
