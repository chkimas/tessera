import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { db } from '@/lib/db'
import { organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'

const PLAN_STATUS_MAP: Record<string, string> = {
  active: 'active',
  trialing: 'trialing',
  past_due: 'past_due',
  unpaid: 'unpaid',
  canceled: 'canceled',
}

async function updateOrgPlan(
  orgId: string,
  data: {
    status: string
    subId: string
    customerId: string
  }
) {
  const planStatus = PLAN_STATUS_MAP[data.status] || 'free'
  await db
    .update(organizations)
    .set({
      planStatus,
      stripeSubscriptionId: data.subId,
      stripeCustomerId: data.customerId,
    })
    .where(eq(organizations.id, orgId))
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.metadata?.orgId && session.subscription) {
          await updateOrgPlan(session.metadata.orgId, {
            status: 'active',
            subId: session.subscription as string,
            customerId: session.customer as string,
          })
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        if (sub.metadata?.orgId) {
          await updateOrgPlan(sub.metadata.orgId, {
            status: sub.status,
            subId: sub.id,
            customerId: sub.customer as string,
          })
        }
        break
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Stripe Webhook Error:', err)
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
  }
}
