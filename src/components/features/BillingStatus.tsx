export default function BillingStatus({ plan, status }: { plan: string; status: string }) {
  const isActive = status === 'active' || status === 'trialing'

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Current Plan
        </p>
        <p className="text-lg font-bold text-slate-900 capitalize">{plan}</p>
      </div>
      <div className="text-right">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {status.toUpperCase()}
        </span>
        {!isActive && (
          <p className="text-[10px] text-slate-400 mt-1 italic">Deployments restricted</p>
        )}
      </div>
    </div>
  )
}
