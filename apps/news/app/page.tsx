import { Button } from "@awfixersites/ui/components/button";

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function Page() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-5">
        <h1 className="text-4xl font-semibold tracking-tight">AWFixer News</h1>
        <p className="text-lg text-muted-foreground">Coming soon.</p>
        <Button asChild size="lg" className="gap-2">
          <a
            href="https://x.com/intent/follow?screen_name=AWFixerNews"
            target="_blank"
            rel="noopener noreferrer"
          >
            <XLogo className="size-4" />
            Follow @AWFixerNews on X
          </a>
        </Button>
      </div>
      <p className="fixed bottom-6 text-xs text-muted-foreground">
        Press <kbd className="rounded border px-1 font-mono">d</kbd> to toggle dark mode
      </p>
    </main>
  );
}
