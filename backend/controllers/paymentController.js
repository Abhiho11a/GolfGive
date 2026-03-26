// controllers/paymentController.js
import { stripe } from '../lib/stripe.js'
import { supabaseAdmin } from '../lib/supabase.js'

// POST /api/payment/create-checkout — creates Stripe checkout session
export async function createCheckout(req, res) {
  if (!req.user) {
    return res.status(401).json({ 
      message: "Unauthorized",
      redirect: "/signup"
    });
  }

  const userId = req.user.id;
  const userEmail = req.user.email;
  const { plan } = req.body;

  if (!["monthly", "yearly"].includes(plan)) {
    return res.status(400).json({ message: "Invalid plan" });
  }

  const priceId =
    plan === "monthly"
      ? process.env.STRIPE_MONTHLY_PRICE_ID
      : process.env.STRIPE_YEARLY_PRICE_ID;

  if (!priceId) {
    return res.status(500).json({ message: "Missing price ID" });
  }

  try {
    const { data: existing } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (existing) {
      return res.status(400).json({ message: "Already subscribed" });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: userId },
      });

      customerId = customer.id;

      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?payment=cancelled`,
      metadata: {
        supabase_user_id: userId,
        plan,
      },
      subscription_data: {
        metadata: { supabase_user_id: userId, plan },
      },
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Checkout failed" });
  }
}
// POST /api/payment/cancel — cancel subscription
export async function cancelSubscription(req, res) {
  const userId = req.user.id
  try {
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (!sub?.stripe_subscription_id) {
      return res.status(404).json({ message: 'No active subscription found' })
    }

    // Cancel at period end (not immediately)
    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    await supabaseAdmin
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('user_id', userId)

    res.json({ message: 'Subscription will be cancelled at period end' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel subscription', error: err.message })
  }
}

// GET /api/payment/status — check current subscription status
export async function getSubscriptionStatus(req, res) {
  const userId = req.user.id
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    res.json({ subscription: data || null })
  } catch (err) {
    res.status(500).json({ message: 'Failed to get subscription', error: err.message })
  }
}

// POST /api/payment/webhook — Stripe webhook handler
// NOTE: This route must use raw body (see index.js)
export async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).json({ message: `Webhook Error: ${err.message}` })
  }

  try {
    switch (event.type) {

      // ── New subscription created ──
      case 'customer.subscription.created':
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.supabase_user_id
        const plan = session.metadata?.plan || 'monthly'

        if (!userId) break

        // For checkout.session.completed get the subscription
        let stripeSub = null
        if (event.type === 'checkout.session.completed' && session.subscription) {
          stripeSub = await stripe.subscriptions.retrieve(session.subscription)
        } else if (event.type === 'customer.subscription.created') {
          stripeSub = session
        }

        if (stripeSub) {
          await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: stripeSub.id,
            stripe_customer_id: stripeSub.customer,
            status: stripeSub.status,
            plan,
            current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: stripeSub.cancel_at_period_end,
          }, { onConflict: 'user_id' })
        }
        break
      }

      // ── Subscription renewed or updated ──
      case 'customer.subscription.updated': {
        const sub = event.data.object
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: sub.status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // ── Subscription cancelled or lapsed ──
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // ── Payment failed ──
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer)
        break
      }

      default:
        break
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    res.status(500).json({ message: 'Webhook processing failed' })
  }
}