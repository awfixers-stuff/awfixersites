"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@awfixersites/ui/components/button";
import { FormProgress } from "@awfixersites/ui/components/form-progress";
import { RejectionPanel } from "@awfixersites/ui/components/rejection-panel";
import {
  ApplicationStep,
  AgeStep,
  BranchDetailsStep,
  BranchStep,
  CorrectionsServiceStep,
  EmsServiceStep,
  FederalServiceStep,
  FireServiceStep,
  OtherPublicServiceStep,
  PoliceServiceStep,
  ProfileStep,
  PublicServiceSelectStep,
  PublicServiceStep,
  ReviewStep,
  ScreeningStep,
  VeteranStep,
} from "./enlist-form-steps";
import { FORM_SECTIONS } from "./enlist-data";
import {
  buildStepSequence,
  getSectionProgress,
  STEP_META,
  validateStep,
  type StepErrors,
  type StepId,
} from "./enlist-flow";
import { ENLIST_REJECTION_COPY } from "./rejection-copy";
import {
  defaultEnlistValues,
  draftToSubmittedValues,
  enlistFormSchema,
  getRejectionReason,
  type EnlistFormDraft,
  type EnlistFormValues,
  type RejectionReason,
} from "./enlist-schema";

type EnlistFormProps = {
  onCancel: () => void;
  onSuccess: (values: EnlistFormValues) => void;
  onSubmit: (values: EnlistFormValues) => Promise<void>;
};

function renderStep(
  stepId: StepId,
  values: EnlistFormDraft,
  errors: StepErrors,
  onChange: <K extends keyof EnlistFormDraft>(key: K, value: EnlistFormDraft[K]) => void,
) {
  const props = { values, errors, onChange };

  switch (stepId) {
    case "age":
      return <AgeStep {...props} />;
    case "screening":
      return <ScreeningStep {...props} />;
    case "veteran":
      return <VeteranStep {...props} />;
    case "branch":
      return <BranchStep {...props} />;
    case "branch-details":
      return <BranchDetailsStep {...props} />;
    case "public-service":
      return <PublicServiceStep {...props} />;
    case "public-service-select":
      return <PublicServiceSelectStep {...props} />;
    case "public-service-police":
      return <PoliceServiceStep {...props} />;
    case "public-service-fire":
      return <FireServiceStep {...props} />;
    case "public-service-federal":
      return <FederalServiceStep {...props} />;
    case "public-service-ems":
      return <EmsServiceStep {...props} />;
    case "public-service-corrections":
      return <CorrectionsServiceStep {...props} />;
    case "public-service-other":
      return <OtherPublicServiceStep {...props} />;
    case "profile":
      return <ProfileStep {...props} />;
    case "application":
      return <ApplicationStep {...props} />;
    case "review":
      return <ReviewStep values={values} />;
    default:
      return null;
  }
}

export function EnlistForm({ onCancel, onSuccess, onSubmit }: EnlistFormProps) {
  const [values, setValues] = useState<EnlistFormDraft>(defaultEnlistValues);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<StepErrors>({});
  const [rejection, setRejection] = useState<RejectionReason | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const steps = useMemo(() => buildStepSequence(values), [values]);
  const safeStepIndex = Math.min(stepIndex, Math.max(steps.length - 1, 0));

  useEffect(() => {
    if (stepIndex !== safeStepIndex) {
      setStepIndex(safeStepIndex);
    }
  }, [stepIndex, safeStepIndex]);

  const currentStepId = steps[safeStepIndex] ?? "age";
  const stepMeta = STEP_META[currentStepId];
  const progress = getSectionProgress(steps, safeStepIndex);
  const isFirstStep = safeStepIndex === 0;
  const isLastStep = currentStepId === "review";

  function updateField<K extends keyof EnlistFormDraft>(key: K, value: EnlistFormDraft[K]) {
    setValues((current) => {
      const next = { ...current, [key]: value };

      if (key === "isVeteran" && value === false) {
        next.branch = "";
        next.militaryRank = "";
        next.militaryUnit = "";
        next.militarySpecialty = "";
        next.yearsOfService = "";
        next.dischargeType = "";
        next.combatDeployments = "";
      }

      if (key === "hasPublicService" && value === false) {
        next.publicServiceTypes = [];
      }

      if (key === "branch" && value !== current.branch) {
        next.militaryRank = "";
      }

      if (key === "isSecondGeneration" && value === false && !next.rank) {
        next.rank = "recruit";
      }

      return next;
    });
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function goNext() {
    const stepErrors = validateStep(currentStepId, values);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    const rejectionReason =
      currentStepId === "age" || currentStepId === "screening" ? getRejectionReason(values) : null;
    if (rejectionReason) {
      setRejection(rejectionReason);
      return;
    }

    setErrors({});
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  function goBack() {
    if (rejection) {
      setRejection(null);
      return;
    }

    if (isFirstStep) {
      onCancel();
      return;
    }

    setErrors({});
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  async function handleSubmit() {
    const stepErrors = validateStep("review", values);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    const payload = draftToSubmittedValues(values);
    const result = enlistFormSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: StepErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !fieldErrors[field as keyof EnlistFormDraft]) {
          fieldErrors[field as keyof EnlistFormDraft] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(result.data);
      onSuccess(result.data);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Submission failed. Try again in a moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRestart() {
    setValues(defaultEnlistValues);
    setStepIndex(0);
    setErrors({});
    setRejection(null);
  }

  if (rejection) {
    const copy = ENLIST_REJECTION_COPY[rejection];

    return (
      <RejectionPanel
        title={copy.title}
        body={copy.body}
        footnote={copy.footnote}
        backLabel="Back to enlist"
        onBack={onCancel}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="w-full border border-border/50 p-6 sm:p-8">
      <FormProgress
        sections={FORM_SECTIONS}
        sectionIndex={progress.sectionIndex}
        stepInSection={progress.stepInSection}
        stepsInSection={progress.stepsInSection}
      />

      <div className="mb-6">
        <p className="font-mono text-[0.65rem] tracking-[0.18em] text-crimson uppercase">
          Step {String(safeStepIndex + 1).padStart(2, "0")} /{" "}
          {String(steps.length).padStart(2, "0")}
        </p>
        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-bleach uppercase sm:text-3xl">
          {stepMeta.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{stepMeta.subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepId}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep(currentStepId, values, errors, updateField)}
        </motion.div>
      </AnimatePresence>

      {submitError ? (
        <p className="mt-6 text-sm text-destructive" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={isSubmitting}
          className="font-mono"
        >
          <ChevronLeftIcon data-icon="inline-start" />
          {isFirstStep ? "Cancel" : "Back"}
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="font-mono"
          >
            {isSubmitting ? "Submitting..." : "Submit enlistment"}
          </Button>
        ) : (
          <Button type="button" onClick={goNext} className="font-mono">
            Continue
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        )}
      </div>
    </div>
  );
}

export type { EnlistFormValues };
