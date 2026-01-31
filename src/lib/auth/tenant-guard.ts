import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function protectTenant(requestedOrgId: string) {
  const { userId, orgId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  if (orgId !== requestedOrgId) {
    console.warn(`Unauthorized access attempt: User ${userId} tried to access Org ${requestedOrgId}`)

    if (orgId) {
      redirect(`/dashboard/${orgId}`)
    } else {
      redirect('/onboarding')
    }
  }

  return { userId, orgId }
}
