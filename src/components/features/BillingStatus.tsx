interface BillingStatusProps {
  plan: string
  status: string
}

export default function BillingStatus({ plan, status }: BillingStatusProps) {
  const isActive = status === 'active' || status === 'trialing'

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Account Tier
        </p>
        <p className="text-sm font-bold text-slate-900">{plan}</p>
      </div>

      <div className="h-8 w-px bg-slate-100" />

      <div className="text-right">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
            isActive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {status.toUpperCase()}
        </span>
        {!isActive && (
          <p className="text-[9px] text-amber-600 font-medium mt-1">Deployment Locked</p>
        )}
      </div>
    </div>
  )
}
