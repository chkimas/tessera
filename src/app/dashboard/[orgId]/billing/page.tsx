import { db } from '@/lib/db'
import { organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import BillingStatus from '@/components/features/BillingStatus'
import { createCheckoutSessionAction } from '@/actions/billing-actions'
import { CreditCard, Zap, Check, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ orgId: string }>
}

export default async function BillingPage({ params }: PageProps) {
  const { orgId } = await params
  const { userId } = await auth()
  if (!userId) notFound()

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  })

  if (!org) notFound()

  const isPro = org.planStatus === 'active' || org.planStatus === 'trialing'

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-indigo-500" />
          Subscription & Billing
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your plan, invoices, and payment methods.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-800">Current Plan</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Your organization is currently on the {isPro ? 'Pro' : 'Free'} plan.
                </p>
              </div>
              <BillingStatus status={org.planStatus} />
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div
                className={cn(
                  'p-6 rounded-2xl border-2 transition-all',
                  !isPro ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 opacity-60'
                )}
              >
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                  Free Tier
                </h3>
                <p className="text-3xl font-black text-slate-900 mt-2">
                  $0<span className="text-sm text-slate-500 font-medium">/mo</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {['3 Active Pipelines', 'Basic Blueprints', 'Community Support'].map(feat => (
                    <li
                      key={feat}
                      className="flex items-center gap-2 text-xs font-bold text-slate-600"
                    >
                      <Check className="w-4 h-4 text-emerald-500" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={cn(
                  'p-6 rounded-2xl border-2 transition-all relative',
                  isPro ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100'
                )}
              >
                {!isPro && (
                  <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full">
                    RECOMMENDED
                  </div>
                )}
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                  Pro Plan
                </h3>
                <p className="text-3xl font-black text-slate-900 mt-2">
                  $29<span className="text-sm text-slate-500 font-medium">/mo</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    'Unlimited Pipelines',
                    'Premium Blueprints',
                    'Priority Execution',
                    'Advanced Vault',
                  ].map(feat => (
                    <li
                      key={feat}
                      className="flex items-center gap-2 text-xs font-bold text-slate-600"
                    >
                      <Check className="w-4 h-4 text-emerald-500" /> {feat}
                    </li>
                  ))}
                </ul>
                {!isPro && (
                  <form action={createCheckoutSessionAction.bind(null, orgId, 'pro')}>
                    <button className="w-full mt-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                      Upgrade Now
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
            <Zap className="absolute -right-4 -top-4 w-24 h-24 text-white/5 rotate-12" />
            <h3 className="font-bold text-lg mb-2">Enterprise</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Need custom nodes, dedicated executors, or on-premise deployment?
            </p>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all">
              Contact Sales
            </button>
          </section>

          <section className="p-6 border border-slate-200 rounded-3xl bg-white space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-sm text-slate-800">Secure Billing</h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Payments are processed securely via Stripe. We do not store your credit card
              information on our servers.
            </p>
          </section>
        </aside>
      </div>
    </main>
  )
}
