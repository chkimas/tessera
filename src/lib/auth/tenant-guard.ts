import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function protectTenant(requestedOrgId: string) {
  const { userId, orgId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  if (orgId !== requestedOrgId) {
    if (orgId) {
      redirect(`/dashboard/${orgId}`)
    } else {
      redirect('/onboarding')
    }
  }

  return { userId, orgId }
}

export function withTenantProtection<Args extends unknown[], Return>(
  handler: (...args: Args) => Promise<Return>
): (...args: Args) => Promise<Return> {
  return async (...args: Args): Promise<Return> => {
    const { userId, orgId } = await auth()

    if (!userId || !orgId) {
      throw new Error('Authentication required')
    }

    const firstArg = args[0]
    if (typeof firstArg === 'string' && firstArg.startsWith('org_')) {
      if (firstArg !== orgId) {
        throw new Error('Access denied: Organization mismatch')
      }
    }

    return handler(...args)
  }
}
