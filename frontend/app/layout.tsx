import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "OmniMind V11 — Sovereign AI SaaS",
  description: "Professional sovereign command dashboard by Usama Haseen",
  icons: { icon: "/favicon.svg" },
};

/** App Router root layout — equivalent to pages/_app.js + pages/_document.js */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body className="omni-violet-canvas min-h-screen min-h-[100dvh] overflow-hidden font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
