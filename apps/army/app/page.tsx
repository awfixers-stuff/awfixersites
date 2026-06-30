import { NavLink } from "@/components/nav-link";

const entryPoints = [
  {
    href: "/about",
    label: "About",
    detail: "Who we are and what we stand for.",
  },
  {
    href: "/ranks",
    label: "Ranks",
    detail: "How soldiers earn their stripes.",
  },
  {
    href: "/operations",
    label: "Operations",
    detail: "Active missions in the field.",
  },
  {
    href: "/enlist",
    label: "Enlist",
    detail: "File your papers and join up.",
  },
];

export default function Page() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <section>
          <p className="font-mono text-[0.7rem] font-medium tracking-[0.2em] text-crimson uppercase">
            Legal militia · United States
          </p>
          <h1 className="font-display mt-3 max-w-[14ch] text-5xl leading-[0.92] font-bold tracking-tight text-bleach uppercase sm:text-6xl lg:text-7xl">
            AWFixer&apos;s Army
          </h1>
          <div className="stripe-rule mt-6 max-w-[9rem]" />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A legal militia based in the United States. We exist for the people the government has
            decided they would rather replace — to stand with them, move them to safety, and hold
            the line when no one else will.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <NavLink
              href="/enlist"
              className="inline-flex items-center rounded-sm border border-crimson bg-crimson px-5 py-2.5 font-mono text-sm font-medium text-bleach transition-colors hover:bg-bleach hover:text-crimson"
            >
              Enlist
            </NavLink>
            <NavLink
              href="/about"
              className="inline-flex items-center rounded-sm border border-border/60 px-5 py-2.5 font-mono text-sm text-muted-foreground transition-colors hover:border-navy hover:text-bleach"
            >
              Read the brief
            </NavLink>
          </div>
        </section>

        <section className="border-t border-border/40 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
          <p className="font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase">
            Quick orders
          </p>
          <ul className="mt-4 divide-y divide-border/40">
            {entryPoints.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  className="group flex items-baseline justify-between gap-4 py-4 transition-colors"
                >
                  <span className="font-display text-2xl font-semibold tracking-tight text-bleach uppercase group-hover:text-crimson">
                    {item.label}
                  </span>
                  <span className="hidden text-right text-sm text-muted-foreground sm:block">
                    {item.detail}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
