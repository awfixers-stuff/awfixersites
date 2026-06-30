"use client";

import { useEffect, useState } from "react";

import { MotionBackground } from "@awfixersites/ui/background";
import { Button } from "@awfixersites/ui/components/button";
import { EnlistStandardsModal } from "@/components/enlist-standards-modal";
import { PageIntro } from "@/components/page-intro";
import { NavLink } from "@/components/nav-link";
import { useSplash } from "@/components/splash-provider";

const STANDARDS_MODAL_DELAY_MS = 1500;

export function EnlistPage() {
  const { completed } = useSplash();
  const [standardsOpen, setStandardsOpen] = useState(false);

  useEffect(() => {
    if (!completed) return;

    const timer = setTimeout(() => {
      setStandardsOpen(true);
    }, STANDARDS_MODAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [completed]);

  return (
    <div className="relative -mt-14 min-h-svh pt-14">
      <EnlistStandardsModal open={standardsOpen} onAcknowledge={() => setStandardsOpen(false)} />

      <MotionBackground fill="document">
        <MotionBackground.DotGrid
          dotSize={3}
          gap={26}
          baseColor="rgba(245, 245, 245, 0.22)"
          activeColor="#dc143c"
          ambientAmplitude={1.5}
          colorWave={0.18}
        />
        <MotionBackground.Overlay
          variant="none"
          className="bg-[radial-gradient(ellipse_at_center,transparent_75%,rgba(0,0,0,0.22)_100%)]"
        />
      </MotionBackground>

      <main className="relative z-10 mx-auto flex min-h-svh max-w-3xl flex-col justify-center px-4 py-16 sm:px-6">
        <PageIntro label="Recruitment" title="Enlist">
          <p>
            The ranks are open to U.S. citizens who are willing to do what the government will not.
            File your papers. We read every one.
          </p>
        </PageIntro>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-sm font-mono">
            <NavLink href="/enlist/apply">Open enlistment form</NavLink>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-sm font-mono"
            onClick={() => setStandardsOpen(true)}
          >
            Review standards
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-sm font-mono">
            <NavLink href="/ranks">Review ranks first</NavLink>
          </Button>
        </div>
      </main>
    </div>
  );
}
