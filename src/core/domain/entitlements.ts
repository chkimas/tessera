export type UserRole = 'viewer' | 'developer' | 'approver' | 'admin'

export const Permissions = {
  CAN_EDIT: ['developer', 'admin'],
  CAN_APPROVE: ['approver', 'admin'],
  CAN_DEPLOY: ['admin'],
} as const
