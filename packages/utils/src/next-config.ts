import { withWorkflow } from "workflow/next";

type WithWorkflow = typeof withWorkflow;

/**
 * Applies shared Vercel Workflow DevKit configuration to a Next.js app.
 * Returns a Next.js config factory for `next.config.ts`.
 */
export const withAppUtils: WithWorkflow = (...args) => withWorkflow(...args);

export { withWorkflow } from "workflow/next";
