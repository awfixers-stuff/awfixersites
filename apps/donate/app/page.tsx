import { headers } from "next/headers";

import { DonationCheckout } from "@/components/donation-checkout";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getStripePublishableKey } from "@/lib/stripe";
import { resolveTenant } from "@/lib/tenants";

export default async function DonatePage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const tenant = resolveTenant(host);

  let publishableKey: string;
  try {
    publishableKey = getStripePublishableKey();
  } catch {
    return (
      <div className="flex min-h-svh flex-col">
        <SiteHeader tenant={tenant} />
        <main className="flex flex-1 items-center justify-center px-6 py-20">
          <div className="max-w-md text-center">
            <h1 className="font-display text-3xl">Donations unavailable</h1>
            <p className="mt-4 text-muted-foreground">
              Payments are not configured yet. Please try again later or contact{" "}
              <a href={`mailto:${tenant.contactEmail}`} className="text-foreground underline">
                {tenant.contactEmail}
              </a>
              .
            </p>
          </div>
        </main>
        <SiteFooter tenant={tenant} />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader tenant={tenant} />
      <main className="relative flex-1 px-6 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-bleach/30 to-transparent" />
        <div className="relative z-10">
          <DonationCheckout tenant={tenant} publishableKey={publishableKey} />
        </div>
      </main>
      <SiteFooter tenant={tenant} />
    </div>
  );
}
