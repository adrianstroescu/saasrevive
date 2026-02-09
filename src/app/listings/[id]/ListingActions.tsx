"use client";

import { useState } from "react";

export default function ListingActions({ listingId }: { listingId: string }) {
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function submitInquiry(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    const res = await fetch(`/api/listings/${listingId}/inquiries`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: inquiryMessage }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as any;
      setStatus(data?.error ?? "Failed to send inquiry");
      return;
    }

    setInquiryMessage("");
    setStatus("Inquiry sent");
  }

  async function submitOffer(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    const amount = Number(offerAmount);

    const res = await fetch(`/api/listings/${listingId}/offers`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount, message: offerMessage }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as any;
      setStatus(data?.error ?? "Failed to create offer");
      return;
    }

    setOfferAmount("");
    setOfferMessage("");
    setStatus("Offer submitted");
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_22px_rgba(20,184,166,0.12)]">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-zinc-400">Message</div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            Inquiry
          </span>
        </div>
        <h2 className="mt-2 text-sm font-semibold tracking-tight text-white">
          Connect with seller
        </h2>
        <form className="mt-4 space-y-3" onSubmit={submitInquiry}>
          <textarea
            className="min-h-28 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-zinc-500 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
            placeholder="Write a message to the seller…"
            value={inquiryMessage}
            onChange={(e) => setInquiryMessage(e.target.value)}
            required
          />
          <button
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            type="submit"
          >
            Send inquiry
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_22px_rgba(20,184,166,0.12)]">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-zinc-400">Offer</div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            Transaction
          </span>
        </div>
        <h2 className="mt-2 text-sm font-semibold tracking-tight text-white">
          Make a structured offer
        </h2>
        <form className="mt-4 space-y-3" onSubmit={submitOffer}>
          <label className="block">
            <span className="text-sm text-zinc-300">Offer amount (USD)</span>
            <input
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
              inputMode="numeric"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              required
            />
          </label>
          <textarea
            className="min-h-20 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
            placeholder="Optional note…"
            value={offerMessage}
            onChange={(e) => setOfferMessage(e.target.value)}
          />
          <button
            className="w-full rounded-md bg-teal-500 px-3 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(20,184,166,0.35)] transition hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300/70"
            type="submit"
          >
            Submit offer
          </button>
        </form>
      </div>

      {status ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
          {status}
        </div>
      ) : null}
    </section>
  );
}
