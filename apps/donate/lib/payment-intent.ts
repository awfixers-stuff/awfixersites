import { z } from "zod";

import type { DonateTenant } from "@/lib/tenants";

export const PRESET_AMOUNTS_CENTS = [2500, 5000, 10000, 25000, 100000] as const;

export const MIN_AMOUNT_CENTS = 100;
export const MAX_AMOUNT_CENTS = 999_999_00;

export const createPaymentIntentSchema = z.object({
  amount: z
    .number()
    .int("Amount must be a whole number of cents")
    .min(MIN_AMOUNT_CENTS, "Minimum donation is $1.00")
    .max(MAX_AMOUNT_CENTS, "Amount exceeds the maximum allowed"),
  email: z.email("Enter a valid email for your receipt"),
  name: z
    .string()
    .trim()
    .max(120, "Name must be 120 characters or fewer")
    .optional()
    .or(z.literal("")),
  tenantId: z.string().trim().min(1).max(40),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;

export function paymentIntentMetadata(tenant: DonateTenant, input: CreatePaymentIntentInput) {
  return {
    tenant_id: tenant.id,
    tenant_host: tenant.host,
    parent_url: tenant.parentUrl,
    donor_email: input.email.trim().toLowerCase(),
    donor_name: input.name?.trim() || "",
  };
}