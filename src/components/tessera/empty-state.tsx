import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl',
        className
      )}
    >
      {icon && (
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-800 font-display">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 leading-relaxed font-medium">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
