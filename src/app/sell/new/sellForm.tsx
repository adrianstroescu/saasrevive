"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function parseOptionalInt(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

export default function SellForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [monthlyCosts, setMonthlyCosts] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title,
      description,
      techStack: techStack.trim() ? techStack.trim() : undefined,
      monthlyRevenue: parseOptionalInt(monthlyRevenue),
      monthlyCosts: parseOptionalInt(monthlyCosts),
      askingPrice: parseOptionalInt(askingPrice),
    };

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as any;
      setError(data?.error ?? "Failed to create listing");
      setLoading(false);
      return;
    }

    const data = (await res.json()) as { listingId: string };
    setLoading(false);
    router.push(`/listings/${data.listingId}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm text-zinc-300">Title</span>
        <input
          className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
        />
      </label>

      <label className="block">
        <span className="text-sm text-zinc-300">Description</span>
        <textarea
          className="mt-1 min-h-40 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={20}
        />
      </label>

      <label className="block">
        <span className="text-sm text-zinc-300">Tech stack (optional)</span>
        <input
          className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="e.g. Next.js, Postgres, Stripe"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm text-zinc-300">MRR (optional)</span>
          <input
            className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
            inputMode="numeric"
            value={monthlyRevenue}
            onChange={(e) => setMonthlyRevenue(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm text-zinc-300">Costs (optional)</span>
          <input
            className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
            inputMode="numeric"
            value={monthlyCosts}
            onChange={(e) => setMonthlyCosts(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm text-zinc-300">Asking (optional)</span>
          <input
            className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
            inputMode="numeric"
            value={askingPrice}
            onChange={(e) => setAskingPrice(e.target.value)}
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <button
        disabled={loading}
        className="rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_22px_rgba(20,184,166,0.35)] transition hover:bg-teal-400 disabled:opacity-60"
        type="submit"
      >
        {loading ? "Creating…" : "Create listing"}
      </button>
    </form>
  );
}
