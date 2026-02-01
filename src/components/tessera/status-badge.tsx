import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type WorkflowStatus = 'draft' | 'approved' | 'deployed' | 'paused'
type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
type GenericStatus = 'success' | 'warning' | 'error' | 'info' | 'disabled'

type StatusBadgeProps = {
  status: WorkflowStatus | SubscriptionStatus | GenericStatus | string
  className?: string
  children?: React.ReactNode
}

const statusVariantMap: Record<
  string,
  'success' | 'warning' | 'error' | 'info' | 'disabled' | 'default'
> = {
  draft: 'info',
  approved: 'warning',
  deployed: 'success',
  paused: 'disabled',

  free: 'default',
  trialing: 'warning',
  active: 'success',
  past_due: 'warning',
  canceled: 'error',
  unpaid: 'error',

  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  disabled: 'disabled',
}

export function StatusBadge({ status, className, children }: StatusBadgeProps) {
  const variant = statusVariantMap[status.toLowerCase()] || 'default'

  return (
    <Badge variant={variant} className={cn(className)}>
      {children || status}
    </Badge>
  )
}
