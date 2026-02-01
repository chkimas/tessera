import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn('flex justify-between items-start pb-6 border-b border-slate-200', className)}
    >
      <div className="flex items-center gap-3">
        {icon && <div className="text-indigo-500">{icon}</div>}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display flex items-center gap-3">
            {title}
          </h1>
          {description && <p className="text-slate-500 text-sm mt-1 font-medium">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  )
}
