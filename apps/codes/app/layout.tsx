import { ClinkProvider } from "@awfixersites/telemetry/link";
import clinkConfig from "../clink.json";
import React from "react";
import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";
import { AppUtils } from "@/components/app-utils";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  preload: true,
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a1a",
};

export const metadata: Metadata = {
  title: "AWFixer Codes - Platform to Create",
  description:
    "The creative platform for teams who ship. Build, deploy, and scale with unprecedented velocity.",
  keywords: ["platform", "deployment", "developer tools", "cloud", "CI/CD", "DevOps"],
  authors: [{ name: "AWFixer Codes" }],
  creator: "AWFixer Codes",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://awfixer.codes",
    title: "AWFixer Codes - Platform to Create",
    description:
      "The creative platform for teams who ship. Build, deploy, and scale with unprecedented velocity.",
    siteName: "AWFixer Codes",
  },
  twitter: {
    card: "summary_large_image",
    title: "AWFixer Codes - Platform to Create",
    description:
      "The creative platform for teams who ship. Build, deploy, and scale with unprecedented velocity.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ErrorBoundary>
          <ClinkProvider config={clinkConfig}>{children}</ClinkProvider>
        </ErrorBoundary>
        <AppUtils />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
