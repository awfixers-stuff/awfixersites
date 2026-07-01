"use client";

import { useCallback, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { AlertCircle, CheckCircle2, HeartHandshake, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@awfixersites/ui/components/button";
import { Input } from "@awfixersites/ui/components/input";
import { Label } from "@awfixersites/ui/components/label";

import { MAX_AMOUNT_CENTS, MIN_AMOUNT_CENTS, PRESET_AMOUNTS_CENTS } from "@/lib/payment-intent";
import { stripeAppearance } from "@/lib/stripe-appearance";
import type { DonateTenant } from "@/lib/tenants";
import { cn } from "@/lib/utils";

const donorSchema = z.object({
  email: z.email("Enter a valid email for your receipt"),
  name: z
    .string()
    .trim()
    .max(120, "Name must be 120 characters or fewer")
    .optional()
    .or(z.literal("")),
});

type DonorFormData = z.infer<typeof donorSchema>;

type DonationCheckoutProps = {
  tenant: DonateTenant;
  publishableKey: string;
};

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function PaymentStep({
  tenant,
  amountCents,
  donor,
  onBack,
}: {
  tenant: DonateTenant;
  amountCents: number;
  donor: DonorFormData;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setStatus("submitting");
    setErrorMessage("");

    const returnUrl = `${window.location.origin}/success?amount=${amountCents}`;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
        receipt_email: donor.email,
        payment_method_data: {
          billing_details: {
            email: donor.email,
            name: donor.name?.trim() || undefined,
          },
        },
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message ?? "Payment could not be completed.");
      return;
    }

    setStatus("idle");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-glass-border bg-glass p-5 backdrop-blur-sm">
        <p className="text-sm text-muted-foreground">You&apos;re giving</p>
        <p className="font-display text-3xl">{formatUsd(amountCents)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          to AWFixer&apos;s Church via {tenant.displayName}
        </p>
      </div>

      <div className="rounded-2xl border border-glass-border bg-glass p-5 backdrop-blur-sm">
        <PaymentElement
          options={{
            layout: "tabs",
            business: { name: "AWFixer's Church" },
            defaultValues: {
              billingDetails: {
                email: donor.email,
                name: donor.name?.trim() || undefined,
              },
            },
          }}
        />
      </div>

      {errorMessage ? (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="outline" className="sm:flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          className="sm:flex-1"
          disabled={!stripe || !elements || status === "submitting"}
          onClick={() => void handlePay()}
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Processing
            </>
          ) : (
            <>Give {formatUsd(amountCents)}</>
          )}
        </Button>
      </div>
    </div>
  );
}

export function DonationCheckout({ tenant, publishableKey }: DonationCheckoutProps) {
  const { resolvedTheme } = useTheme();
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);

  const [selectedPreset, setSelectedPreset] = useState<number | "custom">(PRESET_AMOUNTS_CENTS[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [step, setStep] = useState<"amount" | "payment">("amount");
  const [checkoutError, setCheckoutError] = useState("");
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
  } = useForm<DonorFormData>({
    resolver: zodResolver(donorSchema),
    mode: "onChange",
    defaultValues: { email: "", name: "" },
  });

  const amountCents = useMemo(() => {
    if (selectedPreset === "custom") {
      const dollars = Number.parseFloat(customAmount);
      if (!Number.isFinite(dollars)) return 0;
      return Math.round(dollars * 100);
    }
    return selectedPreset;
  }, [customAmount, selectedPreset]);

  const amountIsValid =
    amountCents >= MIN_AMOUNT_CENTS &&
    amountCents <= MAX_AMOUNT_CENTS &&
    Number.isInteger(amountCents);

  const createIntent = useCallback(
    async (donor: DonorFormData) => {
      setIsCreatingIntent(true);
      setCheckoutError("");

      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountCents,
            email: donor.email,
            name: donor.name,
            tenantId: tenant.id,
          }),
        });

        const data = (await response.json()) as { clientSecret?: string; error?: string };

        if (!response.ok || !data.clientSecret) {
          throw new Error(data.error ?? "Unable to start checkout");
        }

        setClientSecret(data.clientSecret);
        setStep("payment");
      } catch (error) {
        setCheckoutError(error instanceof Error ? error.message : "Unable to start checkout");
      } finally {
        setIsCreatingIntent(false);
      }
    },
    [amountCents, tenant.id],
  );

  const onContinue = handleSubmit((donor) => {
    if (!amountIsValid) {
      setCheckoutError("Choose a valid donation amount.");
      return;
    }
    void createIntent(donor);
  });

  const elementsOptions = useMemo<StripeElementsOptions | undefined>(() => {
    if (!clientSecret) return undefined;
    return {
      clientSecret,
      appearance: stripeAppearance(resolvedTheme === "dark"),
    };
  }, [clientSecret, resolvedTheme]);

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-4 py-1.5 text-xs font-mono text-muted-foreground uppercase tracking-widest">
          <HeartHandshake className="size-3.5" />
          501(c)(3)
        </div>
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">Support the mission</h1>
        <p className="mt-4 text-muted-foreground">{tenant.tagline}</p>
      </div>

      {step === "amount" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onContinue();
          }}
          className="space-y-6"
        >
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose an amount</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PRESET_AMOUNTS_CENTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setSelectedPreset(amount)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                    selectedPreset === amount
                      ? "border-foreground bg-foreground text-background"
                      : "border-glass-border bg-glass hover:border-foreground/20",
                  )}
                >
                  {formatUsd(amount)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedPreset("custom")}
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                  selectedPreset === "custom"
                    ? "border-foreground bg-foreground text-background"
                    : "border-glass-border bg-glass hover:border-foreground/20",
                )}
              >
                Custom
              </button>
            </div>
            {selectedPreset === "custom" ? (
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Custom amount (USD)</Label>
                <Input
                  id="custom-amount"
                  inputMode="decimal"
                  placeholder="50.00"
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value)}
                />
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email for receipt</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Name on receipt (optional)</Label>
              <Input id="name" autoComplete="name" placeholder="Your name" {...register("name")} />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>
          </div>

          {checkoutError ? (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!isValid || !amountIsValid || isCreatingIntent}
          >
            {isCreatingIntent ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Preparing checkout
              </>
            ) : (
              <>Continue to payment</>
            )}
          </Button>
        </form>
      ) : null}

      {step === "payment" && clientSecret && elementsOptions ? (
        <Elements stripe={stripePromise} options={elementsOptions}>
          <PaymentStep
            tenant={tenant}
            amountCents={amountCents}
            donor={getValues()}
            onBack={() => {
              setStep("amount");
              setClientSecret(null);
            }}
          />
        </Elements>
      ) : null}

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <CheckCircle2 className="size-3.5" />
        Secure payments powered by Stripe. Receipt sent to your email.
      </p>
    </div>
  );
}
