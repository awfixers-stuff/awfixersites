import { StatusIndicator } from "./status-indicator";

const locations = [
  { city: "San Francisco", region: "US West", latency: "12ms" },
  { city: "New York", region: "US East", latency: "18ms" },
  { city: "London", region: "Europe", latency: "24ms" },
  { city: "Tokyo", region: "Asia Pacific", latency: "32ms" },
  { city: "Sydney", region: "Oceania", latency: "45ms" },
  { city: "Sao Paulo", region: "South America", latency: "38ms" },
];

export function InfrastructureSection({
  status,
}: {
  status: import("@/lib/status").OverallStatus;
}) {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Content */}
          <div>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Infrastructure
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              Global by
              <br />
              default.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              Deploy once, run everywhere. Our edge network spans 17 data centers across 6
              continents, delivering sub-50ms latency to 99% of the world.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-4xl lg:text-5xl font-display mb-2">17</div>
                <div className="text-sm text-muted-foreground">Data centers</div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-display mb-2">99.99%</div>
                <div className="text-sm text-muted-foreground">Uptime SLA</div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-display mb-2">&lt;50ms</div>
                <div className="text-sm text-muted-foreground">Global latency</div>
              </div>
            </div>
          </div>

          {/* Right: Location list */}
          <div>
            <div className="border border-foreground/10">
              {/* Header */}
              <div className="px-6 py-4 border-b border-foreground/10 flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">Edge Network</span>
                <span className="flex items-center gap-2 text-xs font-mono">
                  <StatusIndicator status={status} variant="short" />
                </span>
              </div>

              {/* Locations */}
              <div>
                {locations.map((location) => (
                  <div
                    key={location.city}
                    className="px-6 py-5 border-b border-foreground/5 last:border-b-0 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-2 h-2 rounded-full bg-foreground/30" />
                      <div>
                        <div className="font-medium">{location.city}</div>
                        <div className="text-sm text-muted-foreground">{location.region}</div>
                      </div>
                    </div>
                    <span className="font-mono text-sm text-muted-foreground">
                      {location.latency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
