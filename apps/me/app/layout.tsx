import { ClinkProvider } from "@awfixersites/telemetry/link";
import clinkConfig from "../clink.json";
import { Geist, Geist_Mono } from "next/font/google";

import "@awfixersites/ui/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@awfixersites/ui/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          <ClinkProvider config={clinkConfig}>{children}</ClinkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
