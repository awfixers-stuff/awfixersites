"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@awfixersites/ui/components/button";
import { Input } from "@awfixersites/ui/components/input";
import { Textarea } from "@awfixersites/ui/components/textarea";
import { Card } from "@awfixersites/ui/components/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const tipSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  handle: z
    .string()
    .trim()
    .max(100, "Handle must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  tip: z
    .string()
    .trim()
    .min(10, "Tip must be at least 10 characters")
    .max(5000, "Tip must be less than 5000 characters")
    .refine(
      (val) => val.split(/\s+/).filter((w) => w.length > 0).length >= 10,
      "Tip must contain at least 10 words",
    ),
});

type TipFormData = z.infer<typeof tipSchema>;

export function TipForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<TipFormData>({
    resolver: zodResolver(tipSchema),
    mode: "onChange",
  });

  const tipValue = watch("tip");
  const tipWordCount = tipValue
    ? tipValue
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length
    : 0;
  const tipCharCount = tipValue ? tipValue.length : 0;

  const onSubmit = async (data: TipFormData) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/submit-tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || "Failed to submit tip");
      }

      setSubmitStatus("success");
      reset();
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An error occurred while submitting your tip",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card className="border-border bg-card border p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Name
              <span className="text-destructive ml-1">*</span>
            </label>
            <Input
              id="name"
              placeholder="Enter your name or pseudonym"
              {...register("name")}
              disabled={isSubmitting}
              className="font-mono text-sm"
            />
            {errors.name && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="handle" className="block text-sm font-medium">
              X Handle
              <span className="text-muted-foreground ml-1 text-xs">(optional)</span>
            </label>
            <Input
              id="handle"
              placeholder="@yourhandle"
              {...register("handle")}
              disabled={isSubmitting}
              className="font-mono text-sm"
            />
            {errors.handle && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" />
                {errors.handle.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="tip" className="block text-sm font-medium">
              Tip
              <span className="text-destructive ml-1">*</span>
            </label>
            <Textarea
              id="tip"
              placeholder="Share your tip here..."
              {...register("tip")}
              disabled={isSubmitting}
              rows={6}
              className="resize-none font-mono text-sm"
            />
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <div className="space-x-4">
                <span>{tipCharCount} characters</span>
                <span>{tipWordCount} words</span>
              </div>
            </div>
            {errors.tip && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" />
                {errors.tip.message}
              </p>
            )}
          </div>

          {submitStatus === "success" && (
            <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-800 dark:text-green-200">
                Tip submitted successfully. Thank you for your contribution.
              </p>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-md border p-3">
              <AlertCircle className="text-destructive h-4 w-4 shrink-0" />
              <p className="text-destructive text-sm">{errorMessage}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full font-mono"
            size="lg"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Submitting..." : "Submit Tip"}
          </Button>
        </form>
      </Card>
    </div>
  );
}