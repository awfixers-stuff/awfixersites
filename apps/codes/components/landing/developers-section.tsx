"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

const codeExamples = [
  {
    label: "Install",
    code: `npm install @awfixer/sdk

# or
yarn add @awfixer/sdk
pnpm add @awfixer/sdk`,
  },
  {
    label: "Initialize",
    code: `import { AWFixer } from '@awfixer/sdk'

const awfixer = new AWFixer({
  apiKey: process.env.AWFIXER_KEY
})`,
  },
  {
    label: "Deploy",
    code: `const app = await awfixer.deploy({
  name: 'my-app',
  region: 'auto',
  scaling: {
    min: 1,
    max: 100
  }
})

console.log('Live at:', app.url)`,
  },
];

const features = [
  { title: "TypeScript native", description: "Full type safety with auto-generated types." },
  { title: "Zero config", description: "Sensible defaults that just work." },
  { title: "Edge-ready", description: "Runs anywhere: Node, Deno, Bun, browsers." },
  { title: "12KB gzipped", description: "Lightweight with zero dependencies." },
];

export function DevelopersSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab]!.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left: Content */}
          <div>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              For developers
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              Built by devs.
              <br />
              <span className="text-muted-foreground">For devs.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              A thoughtfully designed SDK that gets out of your way. Ship faster with intuitive APIs
              and exceptional documentation.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature) => (
                <div key={feature.title}>
                  <h3 className="font-medium mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Code block */}
          <div className="lg:sticky lg:top-32">
            <div className="border border-foreground/10">
              {/* Tabs */}
              <div className="flex items-center border-b border-foreground/10">
                {codeExamples.map((example, idx) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`px-6 py-4 text-sm font-mono transition-colors relative ${
                      activeTab === idx
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {example.label}
                    {activeTab === idx && (
                      <span className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
                    )}
                  </button>
                ))}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-4 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Code content */}
              <div className="p-8 font-mono text-sm bg-foreground/[0.02] min-h-[220px]">
                <pre className="text-foreground/80">
                  {codeExamples[activeTab]!.code.split("\n").map((line, lineIndex) => (
                    <div key={`${activeTab}-${lineIndex}`} className="leading-loose">
                      <span className="text-foreground/20 select-none w-8 inline-block">
                        {lineIndex + 1}
                      </span>
                      {line}
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
