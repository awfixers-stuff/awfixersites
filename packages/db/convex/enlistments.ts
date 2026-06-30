import { mutation } from "./_generated/server";

import { enlistmentInput } from "./enlistments.shared";

export const submit = mutation({
  args: {
    enlistment: enlistmentInput,
  },
  handler: async (ctx, { enlistment }) => {
    const callsign = enlistment.callsign.trim();
    const email = enlistment.email.trim().toLowerCase();

    if (callsign.length < 2) {
      throw new Error("Callsign must be at least 2 characters.");
    }

    if (enlistment.age < 18) {
      throw new Error("You must be at least 18 to enlist at this time.");
    }

    if (!enlistment.isUsCitizen) {
      throw new Error("U.S. citizenship is required.");
    }

    if (enlistment.onRegistry) {
      throw new Error("Registry status disqualifies enlistment.");
    }

    if (enlistment.message.trim().length < 24) {
      throw new Error("Tell us a little more about why you want to enlist.");
    }

    const enlistmentId = await ctx.db.insert("enlistments", {
      ...enlistment,
      callsign,
      email,
      message: enlistment.message.trim(),
      submittedAt: Date.now(),
      status: "pending",
    });

    return { enlistmentId };
  },
});
