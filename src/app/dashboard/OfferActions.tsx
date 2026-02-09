"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OfferActions({
  offerId,
  status,
}: {
  offerId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"ACCEPT" | "DECLINE" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function update(action: "ACCEPT" | "DECLINE") {
    setLoading(action);
    setError(null);

    const res = await fetch(`/api/offers/${offerId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as any;
      setError(data?.error ?? "Failed to update offer");
      setLoading(null);
      return;
    }

    setLoading(null);
    router.refresh();
  }

  if (status !== "PENDING") {
    return (
      <div className="inline-flex rounded-full bg-black/5 px-2.5 py-1 text-xs text-neutral-700">
        Status: {status}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 px-2.5 py-1.5 text-xs font-medium text-white disabled:opacity-60"
        disabled={loading !== null}
        onClick={() => update("ACCEPT")}
      >
        {loading === "ACCEPT" ? "Accepting…" : "Accept"}
      </button>
      <button
        type="button"
        className="rounded-md border border-black/10 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-black/5 disabled:opacity-60"
        disabled={loading !== null}
        onClick={() => update("DECLINE")}
      >
        {loading === "DECLINE" ? "Declining…" : "Decline"}
      </button>
      {error ? <div className="text-xs text-rose-700">{error}</div> : null}
    </div>
  );
}
