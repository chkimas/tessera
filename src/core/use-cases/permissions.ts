import { UserRole } from '@/core/domain/entitlements'

const ROLE_PERMISSIONS = {
  CAN_EDIT: ['developer', 'admin'],
  CAN_APPROVE: ['approver', 'admin'],
  CAN_DEPLOY: ['admin'],
} as const

export function canUserPerformAction(
  userRole: UserRole,
  action: keyof typeof ROLE_PERMISSIONS
): boolean {
  const allowedRoles = ROLE_PERMISSIONS[action] as readonly UserRole[]
  return allowedRoles.includes(userRole)
}

export function canApproveWorkflow(userId: string, creatorId: string, userRole: UserRole): boolean {
  if (userRole !== 'approver' && userRole !== 'admin') return false
  return userId !== creatorId
}
