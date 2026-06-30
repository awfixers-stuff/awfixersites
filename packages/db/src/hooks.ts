"use client";

import { useCallback } from "react";

import type { EnlistmentInput } from "./enlistments";

export type { EnlistmentInput, SubmitEnlistmentArgs } from "./enlistments";

export function useSubmitEnlistment() {
  return useCallback(async (enlistment: EnlistmentInput) => {
    const response = await fetch("/api/enlistments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enlistment }),
    });

    const payload = (await response.json().catch(() => null)) as {
      enlistmentId?: string;
      error?: string;
    } | null;

    if (!response.ok) {
      throw new Error(payload?.error ?? "Failed to submit enlistment.");
    }

    return payload as { enlistmentId: string };
  }, []);
}