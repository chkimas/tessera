import { cn } from '@/lib/utils'

type StatusDotProps = {
  status: 'success' | 'warning' | 'error' | 'info' | 'disabled' | 'offline'
  animate?: boolean
  className?: string
  label?: string
}

const statusColors = {
  success: {
    dot: 'bg-emerald-500',
    pulse: 'bg-emerald-400',
  },
  warning: {
    dot: 'bg-amber-500',
    pulse: 'bg-amber-400',
  },
  error: {
    dot: 'bg-red-500',
    pulse: 'bg-red-400',
  },
  info: {
    dot: 'bg-blue-500',
    pulse: 'bg-blue-400',
  },
  disabled: {
    dot: 'bg-slate-400',
    pulse: 'bg-slate-300',
  },
  offline: {
    dot: 'bg-slate-300',
    pulse: 'bg-slate-200',
  },
}

export function StatusDot({ status, animate = false, className, label }: StatusDotProps) {
  const colors = statusColors[status]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative flex h-2 w-2">
        {animate && (
          <div
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              colors.pulse
            )}
          />
        )}
        <div className={cn('relative inline-flex rounded-full h-2 w-2', colors.dot)} />
      </div>
      {label && <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>}
    </div>
  )
}
