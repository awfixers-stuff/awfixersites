import { TipForm } from "@/components/tip-form";

export default function Home() {
  return (
    <main className="bg-background min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-mono text-4xl font-bold tracking-tight sm:text-5xl">
            AWFixer Tips
          </h1>
          <p className="text-muted-foreground font-mono text-lg">
            Submit your tips anonymously. We take your information seriously.
          </p>
        </div>

        <TipForm />

        <div className="text-muted-foreground mt-12 space-y-2 text-center font-mono text-sm">
          <p>
            All submissions are forwarded to{" "}
            <span className="font-bold">tips@updates.awfixer.me</span>
          </p>
          <p>Your privacy is protected. We do not store or log submissions.</p>
        </div>
      </div>
    </main>
  );
}
