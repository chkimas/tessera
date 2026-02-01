import { db } from '@/lib/db'
import { secrets } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import SecretsForm from '@/components/features/SecretsForm'
import SecretsList from '@/components/features/SecretsList'
import { ShieldCheck, Lock, Info } from 'lucide-react'

interface PageProps {
  params: Promise<{ orgId: string }>
}

export default async function VaultPage({ params }: PageProps) {
  const { orgId } = await params
  const { userId } = await auth()
  if (!userId) notFound()

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
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            Security Vault
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Securely manage API keys and environment variables for your n8n nodes.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            AES-256 Encrypted
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              Add New Secret
            </h2>
            <SecretsForm />
          </section>

          <section className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Secrets are encrypted at rest. Once saved, the raw value cannot be retrieved, only
                overwritten or deleted.
              </p>
            </div>
          </section>
        </div>

        <div className="lg:col-span-8">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800">Vaulted Credentials</h2>
            </div>
            <SecretsList secrets={orgSecrets} />
          </section>
        </div>
      </div>
    </main>
  )
}
