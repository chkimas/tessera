import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { db } from '@/lib/db'
import { organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'

function normalizeStripeStatus(status: Stripe.Subscription.Status): string {
  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    unpaid: 'unpaid',
    canceled: 'canceled',
    incomplete: 'free',
    incomplete_expired: 'free',
  }
  return statusMap[status] || 'free'
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )

    const relevantEvents = [
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
    ]

    if (relevantEvents.includes(event.type)) {
      const subscription = event.data.object as Stripe.Subscription

      const orgId = subscription.metadata?.orgId

      if (orgId) {
        await db
          .update(organizations)
          .set({
            planStatus: normalizeStripeStatus(subscription.status),
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
          })
          .where(eq(organizations.id, orgId))
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
