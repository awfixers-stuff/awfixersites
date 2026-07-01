import { z } from "zod";

export const clinkConfigSchema = z.object({
  network: z.array(z.string()).default([]),
  utm: z
    .object({
      source: z.string(),
      medium: z.string().default("referral"),
      campaign: z.string().nullable().default(null),
    })
    .optional(),
  click: z
    .object({
      event: z.string().default("link_clicked"),
      properties: z.record(z.string(), z.unknown()).default({}),
    })
    .default({ event: "link_clicked", properties: {} }),
  exclude: z.array(z.string()).default([]),
});

export type ClinkConfig = z.infer<typeof clinkConfigSchema>;

export const CLINK_SAFE_DEFAULT: ClinkConfig = {
  network: [],
  click: { event: "link_clicked", properties: {} },
  exclude: [],
};

export function parseClinkConfig(input: unknown): ClinkConfig {
  return clinkConfigSchema.parse(input);
}

export function parseClinkConfigSafe(input: unknown): {
  config: ClinkConfig;
  error: z.ZodError | null;
} {
  const result = clinkConfigSchema.safeParse(input);
  if (result.success) return { config: result.data, error: null };
  return { config: CLINK_SAFE_DEFAULT, error: result.error };
}
