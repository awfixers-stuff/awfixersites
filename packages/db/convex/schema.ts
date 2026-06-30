import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { enlistmentFields } from "./enlistments.shared";

export default defineSchema({
  enlistments: defineTable({
    ...enlistmentFields,
    submittedAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("rejected")),
  })
    .index("by_email", ["email"])
    .index("by_callsign", ["callsign"])
    .index("by_status", ["status"])
    .index("by_submitted_at", ["submittedAt"]),
});
