'use server'

import { stripe } from '@/lib/stripe/client'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function createCheckoutSessionAction(orgId: string, plan: 'pro' | 'enterprise') {
  const origin = (await headers()).get('origin')

  const priceId =
    plan === 'pro' ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_ENTERPRISE_PRICE_ID

  if (!priceId) {
    throw new Error(`Price ID for plan ${plan} is not configured.`)
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${origin}/dashboard/${orgId}?success=true`,
    cancel_url: `${origin}/dashboard/${orgId}?canceled=true`,
    metadata: { orgId },
    subscription_data: {
      metadata: { orgId },
    },
  })

  if (!session.url) throw new Error('Failed to create checkout session')

  redirect(session.url)
}
