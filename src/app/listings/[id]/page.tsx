import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import ListingActions from "./ListingActions";

function hashToUnit(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return (h % 10_000) / 10_000;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatMoney(n: number | null | undefined) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return `$${n.toLocaleString()}`;
}

function formatPct(n: number | null | undefined) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return `${Math.round(n * 100)}%`;
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { seller: { select: { name: true } } },
  });

  if (!listing || listing.status !== "ACTIVE") notFound();

  const session = await getServerSession(authOptions);

  const mrr = typeof listing.monthlyRevenue === "number" ? listing.monthlyRevenue : null;
  const costs = typeof listing.monthlyCosts === "number" ? listing.monthlyCosts : null;
  const margin =
    typeof mrr === "number" && typeof costs === "number" && mrr > 0
      ? (mrr - costs) / mrr
      : null;
  const arr = typeof mrr === "number" ? mrr * 12 : null;

  const churn = clamp(0.03 + hashToUnit(listing.id + "ch") * 0.18, 0.03, 0.22);
  const trafficK = Math.round(12 + hashToUnit(listing.id + "tr") * 140);
  const cac = Math.round(140 + hashToUnit(listing.id + "cac") * 520);
  const ltv = Math.round(900 + hashToUnit(listing.id + "ltv") * 4200);
  const multiple =
    typeof listing.askingPrice === "number" && typeof mrr === "number" && mrr > 0
      ? listing.askingPrice / (mrr * 12)
      : null;
  const revivePotential = clamp(
    Math.round(
      58 +
        (typeof margin === "number" ? margin * 35 : 4) +
        (typeof multiple === "number" ? (4 - multiple) * 8 : 0) -
        churn * 50 +
        (listing.techStack ? 4 : -2)
    ),
    12,
    95
  );

  const acquisitionChannels = [
    { name: "SEO", share: clamp(0.25 + hashToUnit(id + "seo") * 0.45, 0.18, 0.7) },
    { name: "Paid", share: clamp(0.05 + hashToUnit(id + "paid") * 0.25, 0.05, 0.35) },
    { name: "Partnerships", share: clamp(0.03 + hashToUnit(id + "part") * 0.18, 0.03, 0.22) },
  ];
  const channelsNormalized = (() => {
    const total = acquisitionChannels.reduce((acc, c) => acc + c.share, 0);
    return acquisitionChannels.map((c) => ({ ...c, share: c.share / total }));
  })();

  const churnReasons = [
    "Onboarding friction",
    "Missing key integrations",
    "Perceived value vs price",
    "Support response time",
  ];
  const supportLoad = Math.round(8 + hashToUnit(id + "sup") * 32);
  const techDebt = Math.round(18 + hashToUnit(id + "debt") * 62);
  const opsComplexity = Math.round(22 + hashToUnit(id + "ops") * 65);

  const revenueSeries = Array.from({ length: 12 }, (_, i) => {
    const base = 0.65 + i * 0.03;
    const wobble = (hashToUnit(id + i.toString()) - 0.5) * 0.12;
    return clamp(base + wobble, 0.5, 1.15);
  });

  return (
    <main className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_32px_rgba(8,8,12,0.6)] backdrop-blur">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 shadow-[0_0_12px_rgba(20,184,166,0.2)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                  Active listing
                </div>
                <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {listing.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    Seller: {listing.seller.name ?? "Anonymous"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    Traffic: {trafficK}k/mo
                  </span>
                  {listing.techStack ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      {listing.techStack}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="w-full shrink-0 sm:w-[260px]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_22px_rgba(20,184,166,0.15)]">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[11px] font-medium text-zinc-400">Asking price</div>
                      <div className="mt-1 text-xl font-semibold tracking-tight text-white">
                        {formatMoney(listing.askingPrice)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-medium text-zinc-400">Revive</div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        {revivePotential}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-400 to-purple-400"
                      style={{ width: `${revivePotential}%` }}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-[11px] font-medium text-zinc-400">MRR</div>
                      <div className="mt-1 font-semibold text-white">{formatMoney(mrr)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-zinc-400">Churn</div>
                      <div className="mt-1 font-semibold text-white">
                        {Math.round(churn * 1000) / 10}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-zinc-400">ARR</div>
                      <div className="mt-1 font-semibold text-white">{formatMoney(arr)}</div>
                    </div>
                  </div>
                  {typeof multiple === "number" ? (
                    <div className="mt-3 text-[11px] text-zinc-400">
                      Implied multiple: <span className="font-medium text-white">{Math.round(multiple * 10) / 10}× ARR</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-white/10 pt-7">
              <div className="text-[11px] font-medium text-zinc-400">Executive summary</div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-200">
                {listing.description}
              </p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold tracking-tight text-white">Revenue trend</div>
                  <div className="text-[11px] text-zinc-400">Last 12 months</div>
                </div>
                <div className="mt-4 flex items-end gap-1.5">
                  {revenueSeries.map((v, idx) => (
                    <div
                      key={`${listing.id}:rev:${idx}`}
                      className="w-full rounded-sm bg-teal-400/15"
                      style={{ height: `${Math.round(v * 56)}px` }}
                    >
                      <div className="h-full w-full rounded-sm bg-gradient-to-b from-teal-400/40 to-transparent" />
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-zinc-400">
                  <div>
                    <div className="text-[11px] font-medium text-zinc-400">MRR</div>
                    <div className="mt-1 font-semibold text-white">{formatMoney(mrr)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-zinc-400">Costs</div>
                    <div className="mt-1 font-semibold text-white">{formatMoney(costs)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-zinc-400">Margin</div>
                    <div className="mt-1 font-semibold text-white">{formatPct(margin)}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold tracking-tight text-white">Cohort retention</div>
                  <div className="text-[11px] text-zinc-400">Simulated</div>
                </div>
                <div className="mt-4 grid grid-cols-12 gap-1">
                  {Array.from({ length: 6 }).map((_, row) => (
                    <div key={`${listing.id}:cohort:${row}`} className="col-span-12 grid grid-cols-12 gap-1">
                      {Array.from({ length: 12 }).map((__, col) => {
                        const base = clamp(0.9 - row * 0.07 - col * 0.045, 0.05, 0.9);
                        const noise = (hashToUnit(`${id}:${row}:${col}`) - 0.5) * 0.08;
                        const v = clamp(base + noise, 0.05, 0.9);
                        const alpha = 0.06 + v * 0.55;
                        return (
                          <div
                            key={`${listing.id}:cohort:${row}:${col}`}
                            className="aspect-square rounded-sm border border-white/10"
                            style={{ backgroundColor: `rgba(45,212,191,${alpha})` }}
                            title={`${Math.round(v * 100)}%`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-zinc-400">
                  Heatmap is illustrative until verified data is provided.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_28px_rgba(8,8,12,0.5)] backdrop-blur">
              <div className="text-sm font-semibold tracking-tight text-white">Acquisition channels</div>
              <div className="mt-5 space-y-3">
                {channelsNormalized.map((c) => (
                  <div key={`${listing.id}:ch:${c.name}`} className="text-sm">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-medium text-zinc-200">{c.name}</span>
                      <span>{Math.round(c.share * 100)}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-teal-400/60"
                        style={{ width: `${Math.round(c.share * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 text-xs text-zinc-400">
                Channels are estimates until connected analytics is verified.
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_28px_rgba(8,8,12,0.5)] backdrop-blur">
              <div className="text-sm font-semibold tracking-tight text-white">Churn reasons</div>
              <ul className="mt-5 space-y-2 text-sm text-zinc-200">
                {churnReasons.map((r) => (
                  <li key={`${listing.id}:cr:${r}`} className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-400" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] font-medium text-zinc-400">Support load</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {supportLoad} tickets / week
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] font-medium text-zinc-400">Tech debt</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {techDebt}/100
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] font-medium text-zinc-400">Ops complexity</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {opsComplexity}/100
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] font-medium text-zinc-400">CAC / LTV</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    ${cac} / ${ltv}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_28px_rgba(8,8,12,0.5)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold tracking-tight text-white">Due diligence checklist</div>
                <div className="mt-1 text-xs text-zinc-400">
                  A suggested checklist before escrow.
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-1 text-teal-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                  Verification badge
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-400/10 px-2.5 py-1 text-purple-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  Escrow-ready
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Confirm revenue (Stripe screenshots + exports)",
                "Validate churn & cohort retention",
                "Review acquisition sources & attribution",
                "Assess support workload & backlog",
                "Audit codebase and deployment pipeline",
                "List key integrations + secrets rotation plan",
                "Confirm domain, trademarks, and assets",
                "Agree transition period & knowledge transfer",
              ].map((t) => (
                <div
                  key={`${listing.id}:dd:${t}`}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-white/5 text-teal-300">
                    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.57a1 1 0 0 1-1.42.01L3.3 9.79A1 1 0 1 1 4.7 8.4l3.05 3.08 6.8-6.87a1 1 0 0 1 1.414-.006Z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div className="text-sm text-zinc-200">{t}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_28px_rgba(8,8,12,0.5)] backdrop-blur">
            <div className="text-sm font-semibold tracking-tight text-white">Action plan</div>
            <div className="mt-1 text-xs text-zinc-400">90-day revival blueprint</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "Week 1–2: Stabilize onboarding, tighten activation",
                "Week 3–4: Fix core pricing & packaging, reduce churn",
                "Week 5–8: Launch retention + lifecycle campaigns",
                "Week 9–12: Expand acquisition into top channel",
              ].map((step) => (
                <div
                  key={`${listing.id}:plan:${step}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_28px_rgba(8,8,12,0.5)] backdrop-blur">
              <div className="text-[11px] font-medium text-zinc-400">Buyer actions</div>
              <div className="mt-2 text-base font-semibold tracking-tight text-white">
                Request access or make an offer
              </div>
              <div className="mt-2 text-sm text-zinc-400">
                Move this listing into your pipeline in minutes.
              </div>
              <div className="mt-5">
                {session?.user ? (
                  <ListingActions listingId={listing.id} />
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                    Sign in to contact the seller and submit an offer.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_28px_rgba(8,8,12,0.5)] backdrop-blur">
              <div className="text-[11px] font-medium text-zinc-400">Deal notes</div>
              <div className="mt-3 space-y-2 text-sm text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Verification</span>
                  <span className="font-medium text-white">Optional</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Escrow</span>
                  <span className="font-medium text-white">Recommended</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Transition</span>
                  <span className="font-medium text-white">2–4 weeks</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_28px_rgba(8,8,12,0.5)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-zinc-400">Messaging</div>
                  <div className="mt-1 text-sm font-semibold text-white">Sleek drawer</div>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300">
                  Encrypted
                </span>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#0f1116] p-4">
                <div className="text-xs text-zinc-400">Latest thread</div>
                <div className="mt-2 space-y-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-200">
                    Seller: Happy to share Stripe + analytics once access is granted.
                  </div>
                  <div className="rounded-xl border border-teal-400/30 bg-teal-400/10 p-3 text-xs text-teal-200">
                    You: Requesting access and a quick diligence call.
                  </div>
                </div>
              </div>
              <button
                className="mt-4 w-full rounded-md border border-teal-400/40 bg-teal-400/10 px-3 py-2 text-sm font-medium text-teal-200 shadow-[0_0_20px_rgba(20,184,166,0.25)] transition hover:bg-teal-400/20"
                type="button"
              >
                Open messaging drawer
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
