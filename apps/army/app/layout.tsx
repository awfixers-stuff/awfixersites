import { ClinkProvider } from "@awfixersites/telemetry/link";
import clinkConfig from "../clink.json";
import { Barlow_Condensed, Geist, Geist_Mono } from "next/font/google";

import "@awfixersites/ui/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SplashProvider } from "@/components/splash-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@awfixersites/ui/lib/utils";
import { AppUtils } from "@/components/app-utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        display.variable,
        fontMono.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-svh">
        <ThemeProvider>
          <SplashProvider>
            <div className="flex min-h-svh flex-col">
              <SiteHeader />
              <div className="flex-1">
                <ClinkProvider config={clinkConfig}>{children}</ClinkProvider>
              </div>
              <SiteFooter />
            </div>
          </SplashProvider>
        </ThemeProvider>
        <AppUtils />
      </body>
    </html>
  );
}
