export type UserRole = 'viewer' | 'developer' | 'approver' | 'admin'
export type PlanStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'

const ROLE_PERMISSIONS: Record<string, ReadonlyArray<UserRole>> = {
  CAN_EDIT: ['developer', 'admin'],
  CAN_APPROVE: ['approver', 'admin'],
  CAN_DEPLOY: ['admin'],
}

const PLAN_CAPABILITIES: Record<string, ReadonlyArray<PlanStatus>> = {
  ALLOW_DEPLOYMENT: ['trialing', 'active', 'past_due'],
}

export function canUserDeploy(
  role: UserRole,
  planStatus: string
): { allowed: boolean; reason?: string } {
  if (!ROLE_PERMISSIONS.CAN_DEPLOY.includes(role)) {
    return { allowed: false, reason: 'Insufficient permissions: Admin role required' }
  }

  if (!PLAN_CAPABILITIES.ALLOW_DEPLOYMENT.includes(planStatus as PlanStatus)) {
    return { allowed: false, reason: 'Subscription issue: Deployment locked' }
  }

  return { allowed: true }
}
