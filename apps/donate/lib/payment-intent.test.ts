import { describe, expect, it } from "vitest";

import { createPaymentIntentSchema, paymentIntentMetadata } from "./payment-intent";

const tenant = {
  id: "church",
  host: "donate.awfixer.church",
  displayName: "AWFixer's Church",
  tagline: "Carry the question into the world.",
  parentUrl: "https://awfixer.church",
  contactEmail: "contact@awfixer.church",
};

describe("createPaymentIntentSchema", () => {
  it("accepts valid donation input", () => {
    const parsed = createPaymentIntentSchema.parse({
      amount: 5000,
      email: "donor@example.com",
      name: "Ada Lovelace",
      tenantId: "church",
    });

    expect(parsed.amount).toBe(5000);
    expect(parsed.email).toBe("donor@example.com");
  });

  it("rejects amounts below the minimum", () => {
    expect(() =>
      createPaymentIntentSchema.parse({
        amount: 50,
        email: "donor@example.com",
        tenantId: "church",
      }),
    ).toThrow();
  });
});

describe("paymentIntentMetadata", () => {
  it("includes tenant and donor context for webhooks", () => {
    expect(
      paymentIntentMetadata(tenant, {
        amount: 2500,
        email: "Donor@Example.com",
        name: " Ada ",
        tenantId: "church",
      }),
    ).toEqual({
      tenant_id: "church",
      tenant_host: "donate.awfixer.church",
      parent_url: "https://awfixer.church",
      donor_email: "donor@example.com",
      donor_name: "Ada",
    });
  });
});