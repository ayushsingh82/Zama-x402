import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ScriptLoader } from "@/components/ScriptLoader";

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
  description: "Pay-per-use confidential transactions using Fully Homomorphic Encryption (FHE) technology",
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
        <ScriptLoader />
        <div className="min-h-screen w-full bg-white relative text-gray-900">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
