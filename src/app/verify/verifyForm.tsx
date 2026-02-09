"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function VerifyForm() {
  const { data } = useSession();
  const role = ((data?.user as any)?.role ?? "BUYER") as "SELLER" | "BUYER";

  const [type, setType] = useState<"SELLER" | "BUYER">(role);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await fetch("/api/verification", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, details }),
    });

    const dataRes = (await res.json().catch(() => null)) as any;

    setLoading(false);

    if (!res.ok) {
      setStatus(dataRes?.error ?? "Failed to submit request");
      return;
    }

    setDetails("");
    setStatus("Verification request submitted");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm">Request type</span>
        <select
          className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          <option value="BUYER">Buyer</option>
          <option value="SELLER">Seller</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm">Details</span>
        <textarea
          className="mt-1 min-h-40 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          required
          minLength={10}
          placeholder="Tell us how to verify you (company site, LinkedIn, proof of ownership, etc.)"
        />
      </label>

      {status ? (
        <div className="rounded-md border border-black/10 bg-white/70 px-3 py-2 text-sm text-neutral-700">
          {status}
        </div>
      ) : null}

      <button
        disabled={loading}
        className="rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        type="submit"
      >
        {loading ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
