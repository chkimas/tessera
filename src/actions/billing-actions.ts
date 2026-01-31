'use server'

import { stripe } from '@/lib/stripe/client'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function createCheckoutSessionAction(orgId: string, plan: 'pro' | 'enterprise') {
  const origin = (await headers()).get('origin')

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: plan === 'pro' ? 'price_pro_id' : 'price_ent_id',
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${origin}/dashboard/${orgId}?success=true`,
    cancel_url: `${origin}/dashboard/${orgId}?canceled=true`,
    metadata: {
      orgId: orgId,
    },
    subscription_data: {
      metadata: {
        orgId: orgId,
      },
    },
  })

  if (!session.url) {
    throw new Error('Failed to create checkout session')
  }

  redirect(session.url)
}
