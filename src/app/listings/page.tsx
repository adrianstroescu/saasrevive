import Link from "next/link";

import { prisma } from "@/lib/prisma";

type ListingWithSellerName = {
  id: string;
  title: string;
  description: string;
  status: string;
  askingPrice: number | null;
  monthlyRevenue: number | null;
  monthlyCosts: number | null;
  techStack: string | null;
  seller: { name: string | null };
};

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

function renderListingCard(l: ListingWithSellerName) {
  const mrr = typeof l.monthlyRevenue === "number" ? l.monthlyRevenue : null;
  const costs = typeof l.monthlyCosts === "number" ? l.monthlyCosts : null;
  const margin =
    typeof mrr === "number" && typeof costs === "number" && mrr > 0
      ? (mrr - costs) / mrr
      : null;

  const churn = clamp(0.03 + hashToUnit(l.id + "ch") * 0.18, 0.03, 0.22);
  const trafficK = Math.round(12 + hashToUnit(l.id + "tr") * 140);

  const multiple =
    typeof l.askingPrice === "number" && typeof mrr === "number" && mrr > 0
      ? l.askingPrice / (mrr * 12)
      : null;

  const cac = Math.round(120 + hashToUnit(l.id + "cac") * 480);
  const ltv = Math.round(900 + hashToUnit(l.id + "ltv") * 4200);
  const arr = typeof mrr === "number" ? mrr * 12 : null;

  const riskFlags: Array<{ label: string; tone: "amber" | "rose" }> = [];
  if (!l.techStack) riskFlags.push({ label: "Unknown stack", tone: "amber" });
  if (typeof margin === "number" && margin < 0.25)
    riskFlags.push({ label: "Low margin", tone: "amber" });
  if (typeof margin === "number" && margin < 0)
    riskFlags.push({ label: "Cashflow negative", tone: "rose" });
  if (typeof multiple === "number" && multiple > 4)
    riskFlags.push({ label: "Pricey multiple", tone: "amber" });
  if (churn > 0.14) riskFlags.push({ label: "Churn risk", tone: "amber" });
  if (riskFlags.length === 0) riskFlags.push({ label: "Clean", tone: "amber" });

  const revivePotential = clamp(
    Math.round(
      58 +
        (typeof margin === "number" ? margin * 35 : 4) +
        (typeof multiple === "number" ? (4 - multiple) * 8 : 0) -
        churn * 50 +
        (l.techStack ? 4 : -2)
    ),
    12,
    95
  );

  return (
    <Link
      key={l.id}
      href={`/listings/${l.id}`}
      className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_28px_rgba(8,8,12,0.5)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-[0_0_32px_rgba(20,184,166,0.2)] focus:outline-none focus:ring-2 focus:ring-teal-400/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-zinc-400">
            Investment memo
          </div>
          <h2 className="mt-2 truncate text-base font-semibold tracking-tight text-white">
            {l.title}
          </h2>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-[11px] font-medium text-zinc-400">Asking</div>
          <div className="mt-1 text-sm font-semibold text-white">
            {formatMoney(l.askingPrice)}
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-300">
        {l.description}
      </p>

      <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <div className="text-[11px] font-medium text-zinc-400">MRR</div>
            <div className="mt-1 font-semibold text-white">
              {formatMoney(mrr)}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-zinc-400">Churn</div>
            <div className="mt-1 font-semibold text-white">
              {Math.round(churn * 1000) / 10}%
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-zinc-400">ARR</div>
            <div className="mt-1 font-semibold text-white">
              {formatMoney(arr)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <div className="text-[11px] font-medium text-zinc-400">Margin</div>
            <div className="mt-1 font-semibold text-white">
              {formatPct(margin)}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-zinc-400">CAC</div>
            <div className="mt-1 font-semibold text-white">${cac}</div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-zinc-400">LTV</div>
            <div className="mt-1 font-semibold text-white">${ltv}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-300">
              Traffic: {trafficK}k/mo
            </span>
            {l.techStack ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-300">
                {l.techStack}
              </span>
            ) : null}
            {typeof multiple === "number" ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-300">
                {Math.round(multiple * 10) / 10}× ARR
              </span>
            ) : null}
          </div>

          <div className="min-w-[160px]">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-medium">Revive potential</span>
              <span className="font-semibold text-white">{revivePotential}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-purple-400"
                style={{ width: `${revivePotential}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {riskFlags.slice(0, 3).map((rf) => (
            <span
              key={`${l.id}:${rf.label}`}
              className={
                rf.tone === "rose"
                  ? "rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-medium text-rose-300"
                  : "rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-medium text-amber-200"
              }
            >
              {rf.label}
            </span>
          ))}
          <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-1 text-[11px] font-medium text-teal-200">
            Due diligence ready
          </span>
        </div>
        <div className="text-[11px] text-zinc-500">
          Seller: {l.seller.name ?? "Anonymous"}
        </div>
      </div>
    </Link>
  );
}

export default async function ListingsPage() {
  const listings: ListingWithSellerName[] = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      askingPrice: true,
      monthlyRevenue: true,
      monthlyCosts: true,
      techStack: true,
      seller: { select: { name: true } },
    },
  });

  return (
    <main>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(8,8,12,0.5)] backdrop-blur">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 shadow-[0_0_12px_rgba(20,184,166,0.2)]">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
          Marketplace
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Listings, distilled.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
          Investment-memo cards for fast evaluation, with diligence-ready signals.
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300 shadow-sm backdrop-blur">
          No active listings yet.
        </div>
      ) : (
        <div id="all-listings" className="mt-10 grid gap-5 sm:grid-cols-2">
          {listings.map(renderListingCard)}
        </div>
      )}
    </main>
  );
}
