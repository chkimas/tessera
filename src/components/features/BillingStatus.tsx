import React from 'react'

interface BillingStatusProps {
  status: string
}

export default function BillingStatus({ status }: BillingStatusProps) {
  const isPro = status === 'active' || status === 'trialing'

  return (
    <section className="flex items-center gap-4 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-100 transition-colors">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Subscription
        </span>
        <div className="flex items-center gap-2">
          <p className="text-sm font-black text-slate-900 uppercase">
            {isPro ? 'Pro Plan' : 'Free Tier'}
          </p>
          {isPro && (
            <div
              className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
              title="Active Status"
            />
          )}
        </div>
      </div>

      {!isPro && (
        <>
          <div className="h-8 w-px bg-slate-100" aria-hidden="true" />
          <div className="flex flex-col items-end">
            <span className="bg-rose-50 text-rose-600 text-[10px] px-2 py-0.5 rounded-md font-bold border border-rose-100">
              LOCKED
            </span>
            <p className="text-[9px] text-slate-400 mt-1 italic tracking-tight">
              Upgrade to unlock Blueprints
            </p>
          </div>
        </>
      )}
    </section>
  )
}
