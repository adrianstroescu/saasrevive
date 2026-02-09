import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(20).max(10000),
  techStack: z.string().max(200).optional(),
  monthlyRevenue: z.number().int().nonnegative().max(1_000_000_000).optional(),
  monthlyCosts: z.number().int().nonnegative().max(1_000_000_000).optional(),
  askingPrice: z.number().int().positive().max(1_000_000_000).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const role = (session?.user as any)?.role as string | undefined;

  const json = await req.json().catch(() => null);
  const parsed = createListingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const listing = await prisma.listing.create({
    data: {
      sellerId:
        userId && role === "SELLER"
          ? userId
          : await getGuestSellerId(),
      status: "ACTIVE",
      ...parsed.data,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, listingId: listing.id });
}

async function getGuestSellerId() {
  const guestEmail = "guest@saasrevive.local";
  const existing = await prisma.user.findUnique({
    where: { email: guestEmail },
    select: { id: true },
  });

  if (existing?.id) return existing.id;

  const created = await prisma.user.create({
    data: {
      email: guestEmail,
      name: "Guest Seller",
      role: "SELLER",
    },
    select: { id: true },
  });

  return created.id;
}
