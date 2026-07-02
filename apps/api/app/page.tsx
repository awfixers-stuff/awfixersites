import { listTargetIds } from "@awfixersites/links";

export default function ApiHomePage() {
  const targets = listTargetIds();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 font-mono text-sm">
      <h1 className="mb-4 text-2xl font-semibold">api.awfixer.me</h1>
      <p className="mb-8 text-muted-foreground">
        Central API for the AWFixer fleet — clink redirects, OAuth gateway, and shared services.
      </p>
      <section>
        <h2 className="mb-2 font-semibold">Clink targets</h2>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          {targets.map((id) => (
            <li key={id}>
              <a className="underline" href={`/l/${id}`}>
                /l/{id}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}