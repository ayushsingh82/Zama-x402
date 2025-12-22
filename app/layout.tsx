import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "x402 powered by zama fhe",
  description: "Developer guardrails for x402 - Define spend limits, rate limits, and usage quotas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://cdn.zama.org/relayer-sdk-js/0.3.0-8/relayer-sdk-js.umd.cjs"
          strategy="beforeInteractive"
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
