import Link from "next/link";
import { headers } from "next/headers";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { paymentIntentIdFromClientSecret } from "@awfixersites/db/donations";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getStripe } from "@/lib/stripe";
import { resolveTenant } from "@/lib/tenants";
import { cn } from "@/lib/utils";

type SuccessPageProps = {
  searchParams: Promise<{
    amount?: string;
    payment_intent_client_secret?: string;
    redirect_status?: string;
  }>;
};

function formatUsdFromCents(cents: number): string | null {
  if (!Number.isFinite(cents) || cents <= 0) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const tenant = resolveTenant(host);
  const params = await searchParams;

  const fallbackAmountCents = Number.parseInt(params.amount ?? "", 10);
  let amountCents = Number.isFinite(fallbackAmountCents) ? fallbackAmountCents : 0;
  let paymentConfirmed = params.redirect_status === "succeeded";

  const clientSecret = params.payment_intent_client_secret;
  if (clientSecret) {
    try {
      const stripe = getStripe();
      const paymentIntentId = paymentIntentIdFromClientSecret(clientSecret);
      if (paymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        amountCents = paymentIntent.amount;
        paymentConfirmed = paymentIntent.status === "succeeded";
      }
    } catch (error) {
      console.error("Failed to verify donation on success page:", error);
    }
  }

  const formattedAmount = formatUsdFromCents(amountCents);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader tenant={tenant} />
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <div
            className={cn(
              "mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-glass-border bg-glass",
              !paymentConfirmed && "border-destructive/30 bg-destructive/10",
            )}
          >
            {paymentConfirmed ? (
              <CheckCircle2 className="size-8 text-foreground" />
            ) : (
              <AlertCircle className="size-8 text-destructive" />
            )}
          </div>
          <h1 className="font-display text-4xl leading-tight">
            {paymentConfirmed ? "Thank you" : "Payment incomplete"}
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {paymentConfirmed ? (
              formattedAmount ? (
                <>
                  Your <strong className="text-foreground">{formattedAmount}</strong> gift to
                  AWFixer&apos;s Church has been received.
                </>
              ) : (
                <>Your gift to AWFixer&apos;s Church has been received.</>
              )
            ) : (
              <>
                We couldn&apos;t confirm your payment. If you were charged, a receipt will still
                arrive by email. Otherwise, please try again.
              </>
            )}{" "}
            {paymentConfirmed ? "A receipt is on its way to your inbox." : null}
          </p>
          <Link
            href={paymentConfirmed ? tenant.parentUrl : "/"}
            className={cn(
              "mt-8 inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-medium",
              "border border-foreground/20 text-foreground/80 transition-colors hover:bg-foreground/5",
            )}
          >
            {paymentConfirmed ? `Return to ${tenant.displayName}` : "Try again"}
          </Link>
        </div>
      </main>
      <SiteFooter tenant={tenant} />
    </div>
  );
}
