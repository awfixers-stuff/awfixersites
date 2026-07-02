import { z } from "zod";

export const internalLinkSchema = z.object({
  kind: z.literal("internal"),
  path: z.string().startsWith("/"),
});

export const externalLinkSchema = z.object({
  kind: z.literal("external"),
  url: z.string().url(),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().nullable().optional(),
    })
    .optional(),
});

export const linkEntrySchema = z.discriminatedUnion("kind", [
  internalLinkSchema,
  externalLinkSchema,
]);

export type InternalLinkEntry = z.infer<typeof internalLinkSchema>;
export type ExternalLinkEntry = z.infer<typeof externalLinkSchema>;
export type LinkEntry = z.infer<typeof linkEntrySchema>;

export const linkRegistrySchema = z.record(z.string(), linkEntrySchema);

export type LinkRegistry = z.infer<typeof linkRegistrySchema>;