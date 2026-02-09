"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function SupportPage() {
  const { data } = useSession();

  const [email, setEmail] = useState(data?.user?.email ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, subject, message }),
    });

    const dataRes = (await res.json().catch(() => null)) as any;

    setLoading(false);

    if (!res.ok) {
      setStatus(dataRes?.error ?? "Failed to create ticket");
      return;
    }

    setSubject("");
    setMessage("");
    setStatus("Support ticket created");
  }

  return (
    <main className="mx-auto max-w-xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_28px_rgba(20,184,166,0.2)] backdrop-blur">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-200 shadow-[0_0_14px_rgba(20,184,166,0.35)]">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
          Support
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
          Contact us
        </h1>
        <p className="mt-2 text-sm text-zinc-300">
          Create a support ticket and we’ll follow up.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm text-zinc-300">Email</span>
            <input
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">Subject</span>
            <input
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              minLength={3}
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">Message</span>
            <textarea
              className="mt-1 min-h-40 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={10}
            />
          </label>

          {status ? (
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300">
              {status}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(20,184,166,0.35)] transition hover:bg-teal-400 disabled:opacity-60"
            type="submit"
          >
            {loading ? "Submitting…" : "Submit ticket"}
          </button>
        </form>
      </div>
    </main>
  );
}
