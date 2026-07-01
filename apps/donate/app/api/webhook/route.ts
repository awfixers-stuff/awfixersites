import { markDonationFailed, syncDonationFromPaymentIntent } from "@awfixersites/db/donations";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe";

/** Stripe server webhooks — no browser BotID challenge; verified via stripe-signature only. */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return Response.json({ error: "Webhook is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const stripe = getStripe();
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
      case "payment_intent.processing": {
        const paymentIntent = event.data.object;
        await syncDonationFromPaymentIntent(paymentIntent);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        await markDonationFailed(paymentIntent.id);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Donation webhook handler failed:", error);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}
