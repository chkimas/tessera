import { UserRole, Permissions } from '@/core/domain/entitlements'

export function canUserPerformAction(
  userRole: UserRole,
  action: keyof typeof Permissions
): boolean {
  const allowedRoles = Permissions[action] as readonly UserRole[]
  return allowedRoles.includes(userRole)
}

export function canApproveWorkflow(userId: string, creatorId: string, userRole: UserRole): boolean {
  if (userRole !== 'approver' && userRole !== 'admin') return false
  return userId !== creatorId
}
