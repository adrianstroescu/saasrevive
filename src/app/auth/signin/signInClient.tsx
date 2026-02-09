"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/listings";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (!res || res.error) {
      setError("Invalid email or password");
      return;
    }

    router.push(res.url ?? callbackUrl);
  }

  return (
    <main className="mx-auto grid max-w-md place-items-center py-10">
      <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(20,184,166,0.2)] backdrop-blur">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-200 shadow-[0_0_14px_rgba(20,184,166,0.35)]">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
          Welcome back
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Access listings, message sellers, and manage your activity.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm text-zinc-300">Email</span>
            <input
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-zinc-500 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">Password</span>
            <input
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-zinc-500 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>

          {error ? (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-md bg-teal-500 px-3 py-2 text-sm font-medium text-white shadow-[0_0_22px_rgba(20,184,166,0.35)] transition hover:bg-teal-400 disabled:opacity-60"
            type="submit"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-300">
          Sign-up is temporarily disabled.
        </p>
      </div>
    </main>
  );
}
