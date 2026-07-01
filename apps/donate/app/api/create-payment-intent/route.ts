import { rejectBotUnlessHuman } from "@awfixersites/auth/botid-server";
import { createPendingDonation } from "@awfixersites/db/donations";
import { z } from "zod";

import { createPaymentIntentSchema, paymentIntentMetadata } from "@/lib/payment-intent";
import { getStripe } from "@/lib/stripe";
import { resolveTenant } from "@/lib/tenants";

export async function POST(request: Request) {
  const blocked = await rejectBotUnlessHuman();
  if (blocked) {
    return blocked;
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const input = createPaymentIntentSchema.parse(body);
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const tenant = resolveTenant(host);

    if (input.tenantId !== tenant.id) {
      return Response.json({ error: "Tenant mismatch" }, { status: 400 });
    }

    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: input.amount,
      currency: "usd",
      receipt_email: input.email,
      automatic_payment_methods: { enabled: true },
      metadata: paymentIntentMetadata(tenant, input),
      description: `Donation to AWFixer's Church via ${tenant.displayName}`,
    });

    if (!paymentIntent.client_secret) {
      return Response.json({ error: "Unable to start checkout" }, { status: 500 });
    }

    try {
      await createPendingDonation({
        stripePaymentIntentId: paymentIntent.id,
        amountCents: input.amount,
        donorEmail: input.email,
        donorName: input.name,
        tenantId: tenant.id,
        tenantHost: tenant.host,
        parentUrl: tenant.parentUrl,
      });
    } catch (dbError) {
      console.error("Failed to record pending donation:", dbError);
    }

    return Response.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Validation failed" },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes("STRIPE_SECRET_KEY")) {
      console.error("Stripe configuration error");
      return Response.json({ error: "Payments are not configured" }, { status: 503 });
    }

    console.error("Create payment intent error:", error);
    return Response.json({ error: "Unable to start checkout" }, { status: 500 });
  }
}
