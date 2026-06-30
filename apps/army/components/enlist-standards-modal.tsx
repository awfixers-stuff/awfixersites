"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@awfixersites/ui/components/button";
import { cn } from "@awfixersites/ui/lib/utils";

const standards = [
  {
    label: "Criminal record",
    text: "You can be a felon, but you cannot be on any registry.",
  },
  {
    label: "Screening",
    text: "You can be Black, but if so you will be tested.",
  },
  {
    label: "Citizenship",
    text: "We only accept second-generation American citizens as enlisties. Everyone else must take the path of recruit.",
  },
  {
    label: "Discharge",
    text: "Our standards are high — par for the course. If you cannot meet them, you will be dishonorably discharged before you can do damage to our cause.",
  },
];

type EnlistStandardsModalProps = {
  open: boolean;
  onAcknowledge: () => void;
};

export function EnlistStandardsModal({ open, onAcknowledge }: EnlistStandardsModalProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onAcknowledge();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onAcknowledge]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label="Close standards brief"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onAcknowledge}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="enlist-standards-title"
            aria-describedby="enlist-standards-body"
            className={cn(
              "relative z-10 w-full max-w-lg border border-border/60 bg-black",
              "shadow-[0_0_0_1px_rgba(220,20,60,0.15),0_24px_48px_rgba(0,0,0,0.55)]",
            )}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div className="stripe-rule" />

            <div className="px-6 py-6 sm:px-8 sm:py-7">
              <p className="font-mono text-[0.65rem] tracking-[0.2em] text-crimson uppercase">
                Enlistment standards
              </p>
              <h2
                id="enlist-standards-title"
                className="font-display mt-2 text-2xl font-bold tracking-tight text-bleach uppercase sm:text-3xl"
              >
                Read before you file
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                These are non-negotiable. Acknowledge them before proceeding to enlistment.
              </p>

              <ol id="enlist-standards-body" className="mt-6 space-y-4">
                {standards.map((standard, index) => (
                  <li key={standard.label} className="border-l-2 border-navy/80 py-0.5 pl-4">
                    <p className="font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">
                      {String(index + 1).padStart(2, "0")} · {standard.label}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-bleach/90">{standard.text}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  autoFocus
                  className="rounded-sm font-mono"
                  onClick={onAcknowledge}
                >
                  I acknowledge the standards
                </Button>
              </div>
            </div>

            <div className="stripe-rule-thin" />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
