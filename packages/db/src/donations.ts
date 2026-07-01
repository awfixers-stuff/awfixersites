import { DonationStatus } from "../generated/prisma/client";
import { prisma } from "./prisma";

export type PaymentIntentSnapshot = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt_email?: string | null;
  metadata: Record<string, string>;
};

export type CreatePendingDonationInput = {
  stripePaymentIntentId: string;
  amountCents: number;
  currency?: string;
  donorEmail: string;
  donorName?: string;
  tenantId: string;
  tenantHost: string;
  parentUrl: string;
};

export function donationStatusFromStripe(status: string): DonationStatus {
  switch (status) {
    case "succeeded":
      return DonationStatus.succeeded;
    case "processing":
      return DonationStatus.processing;
    case "canceled":
      return DonationStatus.canceled;
    case "requires_payment_method":
    case "requires_confirmation":
    case "requires_action":
    case "requires_capture":
      return DonationStatus.pending;
    default:
      return DonationStatus.failed;
  }
}

export async function createPendingDonation(input: CreatePendingDonationInput) {
  const donorEmail = input.donorEmail.trim().toLowerCase();
  const donorName = input.donorName?.trim() || null;

  return prisma.donation.create({
    data: {
      stripePaymentIntentId: input.stripePaymentIntentId,
      amountCents: input.amountCents,
      currency: input.currency ?? "usd",
      donorEmail,
      donorName,
      tenantId: input.tenantId,
      tenantHost: input.tenantHost,
      parentUrl: input.parentUrl,
      status: DonationStatus.pending,
    },
  });
}

export async function syncDonationFromPaymentIntent(paymentIntent: PaymentIntentSnapshot) {
  const status = donationStatusFromStripe(paymentIntent.status);
  const donorEmail =
    paymentIntent.receipt_email?.trim().toLowerCase() ??
    paymentIntent.metadata.donor_email?.trim().toLowerCase() ??
    "";

  const donorName = paymentIntent.metadata.donor_name?.trim() || null;
  const tenantId = paymentIntent.metadata.tenant_id ?? "church";
  const tenantHost = paymentIntent.metadata.tenant_host ?? "donate.awfixer.church";
  const parentUrl = paymentIntent.metadata.parent_url ?? "https://awfixer.church";

  return prisma.donation.upsert({
    where: { stripePaymentIntentId: paymentIntent.id },
    create: {
      stripePaymentIntentId: paymentIntent.id,
      amountCents: paymentIntent.amount,
      currency: paymentIntent.currency,
      status,
      donorEmail: donorEmail || "unknown@donate.awfixer.church",
      donorName,
      tenantId,
      tenantHost,
      parentUrl,
      succeededAt: status === DonationStatus.succeeded ? new Date() : null,
    },
    update: {
      amountCents: paymentIntent.amount,
      currency: paymentIntent.currency,
      status,
      donorEmail: donorEmail || undefined,
      donorName,
      tenantId,
      tenantHost,
      parentUrl,
      succeededAt: status === DonationStatus.succeeded ? new Date() : undefined,
    },
  });
}

export async function markDonationFailed(stripePaymentIntentId: string) {
  return prisma.donation.updateMany({
    where: { stripePaymentIntentId },
    data: { status: DonationStatus.failed },
  });
}

export function paymentIntentIdFromClientSecret(clientSecret: string): string | null {
  const [paymentIntentId] = clientSecret.split("_secret_");
  if (!paymentIntentId?.startsWith("pi_")) return null;
  return paymentIntentId;
}