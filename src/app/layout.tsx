import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SAASRevive",
  description:
    "A marketplace where founders sell failing SaaS businesses and buyers revive them.",
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
        <Providers>
          <div className="min-h-screen bg-[#0b0c0f] text-zinc-100">
            <div className="pointer-events-none fixed inset-0 -z-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,20,26,0.9),_rgba(11,12,15,0.9)_55%)]" />
              <div className="absolute left-[-10%] top-[-20%] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-teal-500/15 to-transparent blur-3xl" />
              <div className="absolute right-[-10%] top-[10%] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-purple-500/15 to-transparent blur-3xl" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
            </div>

            <Header />
            <div className="mx-auto max-w-6xl px-6">
              <div className="py-10">{children}</div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
