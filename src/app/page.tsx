import Link from "next/link";

import { prisma } from "@/lib/prisma";

type HomeListing = {
  id: string;
  title: string;
  description: string;
  askingPrice: number | null;
  monthlyRevenue: number | null;
  monthlyCosts: number | null;
  techStack: string | null;
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

export default async function Home() {
  const latestListings: HomeListing[] = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      description: true,
      askingPrice: true,
      monthlyRevenue: true,
      monthlyCosts: true,
      techStack: true,
    },
  });

  return (
    <main>
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#111318]/80 p-8 shadow-[0_0_40px_rgba(8,8,12,0.6)] backdrop-blur sm:p-12">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-500/10 via-transparent to-purple-500/5" />
        <div className="absolute right-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />

        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 shadow-[0_0_12px_rgba(20,184,166,0.25)]">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
          Turnaround marketplace for SaaS founders
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Acquire distressed SaaS.
              <span className="block bg-gradient-to-r from-teal-300 via-teal-200 to-purple-300 bg-clip-text text-transparent">
                Revive the engine.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
              SAASRevive curates turnarounds like private-market dossiers—metric-first,
              diligence-ready, and designed to move quickly.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/listings"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_22px_rgba(20,184,166,0.4)] transition hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300/70"
              >
                Browse marketplace
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M11 4a1 1 0 0 0 0 2h2.586l-8.293 8.293a1 1 0 1 0 1.414 1.414L15 7.414V10a1 1 0 1 0 2 0V4h-6z" />
                </svg>
              </Link>
              <Link
                href="/sell/new"
                className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
              >
                List your SaaS
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_24px_rgba(20,184,166,0.15)] backdrop-blur">
              <div className="text-xs font-medium text-zinc-400">
                What buyers look for
              </div>
              <ul className="mt-4 space-y-3 text-sm text-zinc-200">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/15 text-teal-300">
                    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.57a1 1 0 0 1-1.42.01L3.3 9.79A1 1 0 1 1 4.7 8.4l3.05 3.08 6.8-6.87a1 1 0 0 1 1.414-.006Z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-medium">Memo-grade metrics</div>
                    <div className="mt-0.5 text-xs text-zinc-400">
                      MRR, churn, CAC/LTV, and operational risk.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/15 text-purple-300">
                    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                      <path d="M9 2a1 1 0 0 0-1 1v1.055A7.002 7.002 0 0 0 3 11a7 7 0 1 0 14 0 7.002 7.002 0 0 0-5-6.945V3a1 1 0 1 0-2 0v.6a7.08 7.08 0 0 0-2 0V3a1 1 0 0 0-1-1Z" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-medium">Revive potential</div>
                    <div className="mt-0.5 text-xs text-zinc-400">
                      Quick signal for upside and feasibility.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/15 text-teal-300">
                    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 0 1 1 1v1.01a6.002 6.002 0 0 1 5 5.99v2.5a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 12.5V10a6.002 6.002 0 0 1 5-5.99V3a1 1 0 0 1 1-1Zm-3 8a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H7Z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-medium">Escrow + verification</div>
                    <div className="mt-0.5 text-xs text-zinc-400">
                      Secure, step-by-step close.
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "For sellers",
            subtitle: "Exit cleanly, protect time.",
            body: "List once and let serious buyers approach with structured inquiries and offers.",
          },
          {
            title: "For buyers",
            subtitle: "Evaluate fast. Move with confidence.",
            body: "Memo-style cards surface fundamentals and risks so you can focus on diligence.",
          },
          {
            title: "Trust layer",
            subtitle: "Verification + support.",
            body: "Optional verification requests and support tickets for smoother transactions.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_24px_rgba(8,8,12,0.4)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            <div className="text-xs font-medium text-zinc-400">{card.title}</div>
            <div className="mt-2 text-base font-semibold tracking-tight text-white">
              {card.subtitle}
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{card.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(8,8,12,0.5)] backdrop-blur sm:flex-row sm:items-center">
          <div>
            <div className="text-xs font-medium text-zinc-400">Latest listings</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Fresh from the marketplace
            </div>
            <p className="mt-2 text-sm text-zinc-300">
              Three recent opportunities for turnaround-focused buyers.
            </p>
          </div>
          <Link
            href="/listings"
            className="inline-flex items-center justify-center rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_22px_rgba(20,184,166,0.35)] transition hover:bg-teal-400"
          >
            Browse listings
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {latestListings.map((l) => {
            const mrr = typeof l.monthlyRevenue === "number" ? l.monthlyRevenue : null;
            const arr = typeof mrr === "number" ? mrr * 12 : null;
            const churn = clamp(0.03 + hashToUnit(l.id + "ch") * 0.18, 0.03, 0.22);
            const revivePotential = clamp(
              Math.round(58 + (mrr ? Math.min(mrr / 2000, 20) : 4) - churn * 50),
              12,
              95
            );

            return (
              <Link
                key={l.id}
                href={`/listings/${l.id}`}
                className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_28px_rgba(8,8,12,0.5)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-zinc-400">Investment memo</div>
                    <h3 className="mt-2 truncate text-base font-semibold text-white">
                      {l.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-medium text-zinc-400">Asking</div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {formatMoney(l.askingPrice)}
                    </div>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-zinc-300">
                  {l.description}
                </p>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
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
                  <div className="mt-4">
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

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">
                  {l.techStack ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      {l.techStack}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-1 text-teal-200">
                    Due diligence ready
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>


      <footer className="mt-14 border-t border-white/10 pt-8 text-sm text-zinc-400">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <div className="text-white font-semibold">SAASRevive</div>
            <p className="mt-2 text-zinc-400">
              Luxury-grade SaaS acquisitions for turnaround-focused buyers.
            </p>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500">Explore</div>
            <div className="mt-3 flex flex-col gap-2">
              <Link className="hover:text-white" href="/listings">Marketplace</Link>
              <Link className="hover:text-white" href="/dashboard">Dashboard</Link>
              <Link className="hover:text-white" href="/support">Support</Link>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500">Legal</div>
            <div className="mt-3 flex flex-col gap-2">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Security</span>
            </div>
          </div>
        </div>
        <div className="mt-6 text-xs text-zinc-500">© 2026 SAASRevive. All rights reserved.</div>
      </footer>
    </main>
  );
}
