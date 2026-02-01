import { db } from '@/lib/db'
import { organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { createCheckoutSessionAction } from '@/actions/billing-actions'
import {
  CreditCard,
  Check,
  Shield,
  Zap,
  Rocket,
  Crown,
  Building2,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { protectTenant } from '@/lib/auth/tenant-guard'

interface PageProps {
  params: Promise<{ orgId: string }>
}

export default async function BillingPage({ params }: PageProps) {
  const { orgId } = await params
  await protectTenant(orgId)

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  })

  if (!org) notFound()

  const isPro = org.planStatus === 'active' || org.planStatus === 'trialing'
  const currentPlan = isPro ? 'pro' : 'free'

  const plans = [
    {
      id: 'free',
      name: 'Starter',
      price: 0,
      features: [
        '3 Active Workflows',
        'Basic Blueprints',
        'Community Support',
        '24h Log Retention',
      ],
      icon: Zap,
      theme: 'light',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 29,
      features: [
        'Unlimited Workflows',
        'Premium Blueprints',
        'Priority Execution',
        'Advanced Vault',
        '30-Day Logs',
        'Email Support',
      ],
      icon: Rocket,
      theme: 'light',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 60,
      features: [
        'Everything in Pro',
        'Custom n8n Nodes',
        'Dedicated Executors',
        'SLA Guarantees',
        'Unlimited Log Retention',
        'Priority Support',
      ],
      icon: Crown,
      theme: 'premium',
      popular: false,
    },
  ] as const

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
          Orchestrate workflows{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600">
            at any scale
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map(plan => {
          const Icon = plan.icon
          const isActive = plan.id === currentPlan

          return (
            <div
              key={plan.id}
              className={cn(
                'relative group p-6 rounded-2xl border transition-all overflow-hidden flex flex-col',
                (plan.theme as string) === 'premium'
                  ? 'bg-linear-to-br from-slate-900 to-indigo-950 border-indigo-500 text-white shadow-xl shadow-indigo-500/20'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md',
                plan.popular && !isActive && 'border-indigo-400 shadow-lg shadow-indigo-100',
                isActive &&
                  (plan.theme as string) !== 'premium' &&
                  'ring-1 ring-emerald-500 border-emerald-500'
              )}
            >
              <Icon
                className={cn(
                  'absolute -right-8 -bottom-8 w-48 h-48 rotate-12 transition-transform group-hover:scale-110',
                  (plan.theme as string) === 'premium' ? 'text-white/5' : 'text-slate-100'
                )}
              />

              <div className="relative z-10 space-y-5 flex-1">
                <div className="flex justify-between items-start">
                  <h2
                    className={cn(
                      'text-xl font-black tracking-tight uppercase font-display',
                      (plan.theme as string) === 'premium' ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    {plan.name}
                  </h2>
                  {isActive && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                  {plan.popular && !isActive && (
                    <span className="px-2 py-1 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      'text-5xl font-black font-display',
                      (plan.theme as string) === 'premium' ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    ${plan.price}
                  </span>
                  <span
                    className={cn(
                      'font-medium text-sm',
                      (plan.theme as string) === 'premium' ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    /mo
                  </span>
                </div>

                <ul
                  className={cn(
                    'space-y-2.5 pt-4 border-t',
                    (plan.theme as string) === 'premium' ? 'border-white/10' : 'border-slate-200'
                  )}
                >
                  {plan.features.map(f => (
                    <li
                      key={f}
                      className={cn(
                        'flex items-center gap-2 text-xs font-bold uppercase tracking-tight',
                        (plan.theme as string) === 'premium' ? 'text-slate-300' : 'text-slate-700'
                      )}
                    >
                      <Check
                        className={cn(
                          'w-3.5 h-3.5 shrink-0',
                          (plan.theme as string) === 'premium'
                            ? 'text-indigo-400'
                            : 'text-emerald-500'
                        )}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10 mt-6">
                {isActive ? (
                  <Button
                    className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-wider"
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : plan.id === 'free' ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl font-black uppercase tracking-wider opacity-50 cursor-not-allowed"
                    disabled
                  >
                    Starter Tier
                  </Button>
                ) : (
                  <form
                    action={createCheckoutSessionAction.bind(
                      null,
                      orgId,
                      plan.id as 'pro' | 'enterprise'
                    )}
                  >
                    <Button
                      type="submit"
                      className={cn(
                        'w-full rounded-xl font-black uppercase tracking-wider',
                        (plan.theme as string) === 'premium'
                          ? 'bg-white text-slate-900 hover:bg-indigo-50'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      )}
                    >
                      Upgrade to {plan.name}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-700 p-8 text-white relative overflow-hidden shadow-lg">
          <Building2 className="absolute -right-12 -bottom-12 w-64 h-64 text-white/10 rotate-12" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-3 max-w-md">
              <h3 className="text-2xl font-black tracking-tight font-display">Custom Deployment</h3>
              <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                Need on-premise n8n instances, white-label branding, custom node development, or
                dedicated infrastructure? We&apos;ll build a tailored solution for your
                organization.
              </p>
            </div>
            <Button className="rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-black uppercase tracking-wider shrink-0 shadow-lg">
              Contact Sales
            </Button>
          </div>
        </div>

        <div className="md:col-span-4 rounded-2xl bg-slate-50 border border-slate-200 p-8 shadow-sm">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-emerald-100 shrink-0">
                <Shield className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-sm">Secure Billing</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Payments processed via Stripe. PCI-DSS compliant.
                </p>
              </div>
            </div>

            <div className="h-px bg-slate-200" />

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-indigo-100 shrink-0">
                <CreditCard className="w-4 h-4 text-indigo-700" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-sm">No Lock-in</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cancel anytime. Keep all your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
