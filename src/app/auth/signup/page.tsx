"use client";

import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="mx-auto grid max-w-md place-items-center py-10">
      <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(20,184,166,0.2)] backdrop-blur">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-200 shadow-[0_0_14px_rgba(20,184,166,0.35)]">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
          Sign-up paused
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Sign up</h1>
        <p className="mt-2 text-sm text-zinc-300">
          New registrations are temporarily disabled. You can still browse the marketplace and access the dashboard.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-md bg-teal-500 px-3 py-2 text-sm font-medium text-white shadow-[0_0_22px_rgba(20,184,166,0.35)] transition hover:bg-teal-400"
            href="/dashboard"
          >
            Go to dashboard
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            href="/auth/signin"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
