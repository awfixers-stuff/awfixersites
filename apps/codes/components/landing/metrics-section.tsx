const metrics = [
  { value: "2,847,392", label: "API requests today" },
  { value: "99.99%", label: "Uptime this quarter" },
  { value: "23ms", label: "Average response time" },
  { value: "184", label: "Countries served" },
];

export function MetricsSection() {
  return (
    <section id="studio" className="relative py-24 lg:py-32 border-y border-foreground/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 lg:mb-24">
          <div>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Live metrics
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight">
              Performance you
              <br />
              can measure.
            </h2>
          </div>
          <div className="flex items-center gap-4 font-mono text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Live
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/10">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-background p-8 lg:p-12">
              <div className="text-6xl lg:text-8xl font-display tracking-tight">{metric.value}</div>
              <div className="mt-4 text-lg text-muted-foreground">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
