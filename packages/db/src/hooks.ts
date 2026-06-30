"use client";

import type { FunctionArgs } from "convex/server";
import { useMutation } from "convex/react";

import { api } from "../convex/_generated/api";

export type SubmitEnlistmentArgs = FunctionArgs<typeof api.enlistments.submit>;
export type EnlistmentInput = SubmitEnlistmentArgs["enlistment"];

export function useSubmitEnlistment() {
  return useMutation(api.enlistments.submit);
}
