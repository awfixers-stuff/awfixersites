import { Shield, Lock, Eye, FileCheck } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "SOC 2 Type II",
    description: "Independently audited security controls with continuous monitoring.",
  },
  {
    icon: Lock,
    title: "End-to-end encryption",
    description: "AES-256 encryption for data at rest and TLS 1.3 in transit.",
  },
  {
    icon: Eye,
    title: "Zero-trust architecture",
    description: "Every request is authenticated and authorized. No exceptions.",
  },
  {
    icon: FileCheck,
    title: "GDPR & HIPAA",
    description: "Full compliance with data protection and healthcare regulations.",
  },
];

const certifications = ["SOC 2", "ISO 27001", "HIPAA", "GDPR", "CCPA"];

export function SecuritySection() {
  return (
    <section id="security" className="relative py-24 lg:py-32 bg-foreground/[0.02] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: Content */}
          <div>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Security
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              Trust is
              <br />
              non-negotiable.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              Enterprise-grade security isn&apos;t optional. It&apos;s built into every layer of our
              platform, from infrastructure to application.
            </p>

            {/* Certifications */}
            <div className="flex flex-wrap gap-3">
              {certifications.map((cert) => (
                <span
                  key={cert}
                  className="px-4 py-2 border border-foreground/10 text-sm font-mono"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Features */}
          <div className="grid gap-6">
            {securityFeatures.map((feature) => (
              <div
                key={feature.title}
                className="p-6 border border-foreground/10 hover:border-foreground/20 transition-all duration-500 group"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 flex items-center justify-center border border-foreground/10 group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1 group-hover:translate-x-1 transition-transform duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
