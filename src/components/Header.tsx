"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data } = useSession();
  const role = (data?.user as any)?.role as "SELLER" | "BUYER" | undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0c0f]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0b0c0f]/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#111318] shadow-[0_0_20px_rgba(20,184,166,0.15)]">
            <span className="text-xs font-semibold tracking-tight text-white">SR</span>
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-teal-400 shadow-[0_0_0_3px_rgba(11,12,15,0.9)]" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-white">
            SAASRevive
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm text-zinc-300">
          <Link
            className="rounded-md px-3 py-2 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            href="/listings"
          >
            Marketplace
          </Link>
          <Link
            className="rounded-md px-3 py-2 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            href="/sell/new"
          >
            Sell
          </Link>
          {data?.user ? (
            <Link
              className="rounded-md px-3 py-2 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              href="/dashboard"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              className="rounded-md px-3 py-2 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              href="/dashboard"
            >
              Dashboard
            </Link>
          )}
          {data?.user ? (
            <Link
              className="rounded-md px-3 py-2 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              href="/verify"
            >
              Verify
            </Link>
          ) : null}
          <Link
            className="rounded-md px-3 py-2 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            href="/support"
          >
            Support
          </Link>

          {data?.user ? (
            <button
              className="ml-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-zinc-200 shadow-sm transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              onClick={() => signOut({ callbackUrl: "/" })}
              type="button"
            >
              Sign out
            </button>
          ) : (
            <Link
              className="ml-2 inline-flex items-center justify-center rounded-md bg-teal-500/90 px-3 py-2 font-medium text-white shadow-[0_0_18px_rgba(20,184,166,0.35)] transition hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300/70"
              href="/auth/signin"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
