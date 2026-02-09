import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OfferActions from "./OfferActions";

type SellerListing = {
  id: string;
  title: string;
  status: string;
  _count: { inquiries: number; offers: number };
};

type InquiryWithListing = {
  id: string;
  message: string;
  listing: { id: string; title: string };
};

type OfferWithListing = {
  id: string;
  amount: number;
  message: string | null;
  status: string;
  listing: { id: string; title: string };
};

function formatMoney(n: number | null | undefined) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return `$${n.toLocaleString()}`;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const role = (session?.user as any)?.role as "SELLER" | "BUYER" | undefined;

  if (!userId) {
    return (
      <main>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(8,8,12,0.5)] backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 shadow-[0_0_12px_rgba(20,184,166,0.2)]">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            Guest dashboard
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Explore the pipeline.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
            You can browse the dashboard without signing up. Sign in only when you’re ready to message sellers or make offers.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/listings"
              className="inline-flex items-center justify-center rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(20,184,166,0.35)] transition hover:bg-teal-400"
            >
              Browse listings
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_28px_rgba(8,8,12,0.5)] backdrop-blur">
              <div className="text-xs font-medium text-zinc-400">Pipeline</div>
              <div className="mt-1 text-base font-semibold tracking-tight text-white">
                Stages
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  "Watching",
                  "Contacted",
                  "Negotiating",
                  "Won",
                ].map((name) => (
                  <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-semibold text-white">{name}</div>
                    <div className="mt-3 text-xs text-zinc-400">Sign in to populate this stage.</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_24px_rgba(8,8,12,0.5)] backdrop-blur">
              <div className="text-xs font-medium text-zinc-400">Messaging</div>
              <div className="mt-1 text-base font-semibold tracking-tight text-white">
                Deal conversations
              </div>
              <div className="mt-3 text-sm leading-6 text-zinc-300">
                Sign in to access secure messaging with sellers.
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_24px_rgba(8,8,12,0.5)] backdrop-blur">
              <div className="text-xs font-medium text-zinc-400">Documents</div>
              <div className="mt-1 text-base font-semibold tracking-tight text-white">
                Due diligence vault
              </div>
              <div className="mt-3 text-sm leading-6 text-zinc-300">
                Sign in to manage deal documents and tasks.
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (role === "SELLER") {
    const listings: SellerListing[] = await prisma.listing.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { inquiries: true, offers: true } },
      },
    });

    const recentInquiries: InquiryWithListing[] = await prisma.inquiry.findMany({
      where: { listing: { sellerId: userId } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { listing: { select: { id: true, title: true } } },
    });

    const recentOffers: OfferWithListing[] = await prisma.offer.findMany({
      where: { listing: { sellerId: userId } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { listing: { select: { id: true, title: true } } },
    });

    return (
      <main>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(8,8,12,0.5)] backdrop-blur">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-300">Seller view</p>
        </div>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Your listings</h2>
            <Link
              className="rounded-md bg-teal-500 px-3 py-2 text-xs font-medium text-white shadow-[0_0_18px_rgba(20,184,166,0.35)] transition hover:bg-teal-400"
              href="/sell/new"
            >
              Create listing
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300 backdrop-blur">
              No listings yet.
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {listings.map((l: SellerListing) => (
                <Link
                  key={l.id}
                  href={`/listings/${l.id}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_22px_rgba(8,8,12,0.4)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold tracking-tight text-white">
                        {l.title}
                      </div>
                      <div className="mt-2 inline-flex rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-1 text-xs font-medium text-teal-200">
                        {l.status}
                      </div>
                    </div>
                    <div className="text-right text-xs text-zinc-300">
                      <div>Inquiries: {l._count.inquiries}</div>
                      <div>Offers: {l._count.offers}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-sm font-semibold text-white">Recent inquiries</h2>
            {recentInquiries.length === 0 ? (
              <div className="mt-3 text-sm text-zinc-300">None yet.</div>
            ) : (
              <ul className="mt-3 space-y-3 text-sm">
                {recentInquiries.map((i: InquiryWithListing) => (
                  <li key={i.id} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                    <div className="text-xs text-zinc-400">
                      <Link className="font-medium underline text-teal-200" href={`/listings/${i.listing.id}`}>
                        {i.listing.title}
                      </Link>
                    </div>
                    <div className="mt-1 line-clamp-2 text-zinc-200">
                      {i.message}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-sm font-semibold text-white">Recent offers</h2>
            {recentOffers.length === 0 ? (
              <div className="mt-3 text-sm text-zinc-300">None yet.</div>
            ) : (
              <ul className="mt-3 space-y-3 text-sm">
                {recentOffers.map((o: OfferWithListing) => (
                  <li key={o.id} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-zinc-400">
                        <Link className="font-medium underline text-teal-200" href={`/listings/${o.listing.id}`}>
                          {o.listing.title}
                        </Link>
                      </div>
                      <div className="rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-1 text-xs font-medium text-teal-200">
                        ${o.amount}
                      </div>
                    </div>
                    {o.message ? (
                      <div className="mt-1 line-clamp-2 text-zinc-200">
                        {o.message}
                      </div>
                    ) : null}
                    <div className="mt-2">
                      <OfferActions offerId={o.id} status={o.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    );
  }

  const inquiries: InquiryWithListing[] = await prisma.inquiry.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { id: true, title: true } } },
  });

  const offers: OfferWithListing[] = await prisma.offer.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { id: true, title: true } } },
  });

  const pipeline = {
    Watching: [] as Array<{ id: string; title: string; meta: string }>,
    Contacted: inquiries.map((i) => ({
      id: i.id,
      title: i.listing.title,
      meta: "Inquiry sent",
    })),
    Negotiating: offers
      .filter((o) => o.status === "PENDING")
      .map((o) => ({
        id: o.id,
        title: o.listing.title,
        meta: `Offer ${formatMoney(o.amount)} · Pending`,
      })),
    Won: offers
      .filter((o) => o.status === "ACCEPTED")
      .map((o) => ({
        id: o.id,
        title: o.listing.title,
        meta: `Offer ${formatMoney(o.amount)} · Accepted`,
      })),
  };

  return (
    <main>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(8,8,12,0.5)] backdrop-blur">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 shadow-[0_0_12px_rgba(20,184,166,0.2)]">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
          Buyer dashboard
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Your pipeline.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
          Track deals from discovery to closing with a memo-first workflow.
        </p>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_28px_rgba(8,8,12,0.5)] backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-zinc-400">Pipeline</div>
                <div className="mt-1 text-base font-semibold tracking-tight text-white">
                  Stages
                </div>
              </div>
              <Link
                href="/listings"
                className="inline-flex items-center justify-center rounded-md bg-teal-500 px-3 py-2 text-xs font-medium text-white shadow-[0_0_18px_rgba(20,184,166,0.35)] transition hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300/70"
              >
                Browse deals
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["Watching", pipeline.Watching],
                  ["Contacted", pipeline.Contacted],
                  ["Negotiating", pipeline.Negotiating],
                  ["Won", pipeline.Won],
                ] as const
              ).map(([name, items]) => (
                <div
                  key={name}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-white">
                      {name}
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400">
                      {items.length}
                    </div>
                  </div>
                  {items.length === 0 ? (
                    <div className="mt-4 text-xs leading-5 text-zinc-400">
                      {name === "Watching"
                        ? "Add listings to watch."
                        : "No items in this stage."}
                    </div>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {items.slice(0, 6).map((it) => (
                        <li key={it.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="text-xs font-semibold text-white line-clamp-1">
                            {it.title}
                          </div>
                          <div className="mt-1 text-[11px] text-zinc-400 line-clamp-1">
                            {it.meta}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_24px_rgba(8,8,12,0.5)] backdrop-blur">
              <div className="text-xs font-medium text-zinc-400">Saved searches</div>
              <div className="mt-1 text-base font-semibold tracking-tight text-white">
                Automate discovery
              </div>
              <div className="mt-3 text-sm leading-6 text-zinc-300">
                Save search criteria to revisit new deals quickly.
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                No saved searches yet.
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_24px_rgba(8,8,12,0.5)] backdrop-blur">
              <div className="text-xs font-medium text-zinc-400">Watchlist</div>
              <div className="mt-1 text-base font-semibold tracking-tight text-white">
                Shortlist candidates
              </div>
              <div className="mt-3 text-sm leading-6 text-zinc-300">
                Keep a tight list of deals you’re monitoring.
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                Watchlist is empty.
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_24px_rgba(8,8,12,0.5)] backdrop-blur">
            <div className="text-xs font-medium text-zinc-400">Messaging</div>
            <div className="mt-1 text-base font-semibold tracking-tight text-white">
              Deal conversations
            </div>
            <div className="mt-3 text-sm leading-6 text-zinc-300">
              Centralize seller comms while you diligence.
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              No messages yet.
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_24px_rgba(8,8,12,0.5)] backdrop-blur">
            <div className="text-xs font-medium text-zinc-400">Tasks</div>
            <div className="mt-1 text-base font-semibold tracking-tight text-white">
              Diligence checklist
            </div>
            <div className="mt-3 text-sm leading-6 text-zinc-300">
              Track what you need before escrow.
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              No tasks created.
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_24px_rgba(8,8,12,0.5)] backdrop-blur">
            <div className="text-xs font-medium text-zinc-400">Documents</div>
            <div className="mt-1 text-base font-semibold tracking-tight text-white">
              Secure attachments
            </div>
            <div className="mt-3 text-sm leading-6 text-zinc-300">
              Keep exports, screenshots, and notes organized.
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              No documents uploaded.
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_24px_rgba(8,8,12,0.5)] backdrop-blur">
          <div className="text-xs font-medium text-zinc-400">Activity</div>
          <div className="mt-1 text-base font-semibold tracking-tight text-white">
            Your inquiries
          </div>
          {inquiries.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              None yet.
            </div>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {inquiries.map((i: InquiryWithListing) => (
                <li key={i.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-zinc-400">
                    <Link className="font-medium underline text-teal-200" href={`/listings/${i.listing.id}`}>
                      {i.listing.title}
                    </Link>
                  </div>
                  <div className="mt-2 line-clamp-2 text-zinc-200">
                    {i.message}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_24px_rgba(8,8,12,0.5)] backdrop-blur">
          <div className="text-xs font-medium text-zinc-400">Activity</div>
          <div className="mt-1 text-base font-semibold tracking-tight text-white">
            Your offers
          </div>
          {offers.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              None yet.
            </div>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {offers.map((o: OfferWithListing) => (
                <li key={o.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-zinc-400">
                      <Link className="font-medium underline text-teal-200" href={`/listings/${o.listing.id}`}>
                        {o.listing.title}
                      </Link>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white">
                      {formatMoney(o.amount)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">
                    Status: <span className="font-medium text-white">{o.status}</span>
                  </div>
                  {o.message ? (
                    <div className="mt-2 line-clamp-2 text-sm text-zinc-200">
                      {o.message}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
