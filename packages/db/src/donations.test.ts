import { describe, expect, it } from "vitest";

import { DonationStatus } from "../generated/prisma/client";
import { donationStatusFromStripe, paymentIntentIdFromClientSecret } from "./donations";

describe("donationStatusFromStripe", () => {
  it("maps succeeded payments", () => {
    expect(donationStatusFromStripe("succeeded")).toBe(DonationStatus.succeeded);
  });

  it("maps processing payments", () => {
    expect(donationStatusFromStripe("processing")).toBe(DonationStatus.processing);
  });

  it("maps canceled payments", () => {
    expect(donationStatusFromStripe("canceled")).toBe(DonationStatus.canceled);
  });

  it("maps in-flight payments to pending", () => {
    expect(donationStatusFromStripe("requires_payment_method")).toBe(DonationStatus.pending);
    expect(donationStatusFromStripe("requires_action")).toBe(DonationStatus.pending);
  });
});

describe("paymentIntentIdFromClientSecret", () => {
  it("extracts the payment intent id", () => {
    expect(
      paymentIntentIdFromClientSecret("pi_abc123_secret_xyz789"),
    ).toBe("pi_abc123");
  });

  it("returns null for invalid secrets", () => {
    expect(paymentIntentIdFromClientSecret("not-a-secret")).toBeNull();
  });
});