import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  action: z.enum(["ACCEPT", "DECLINE"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const role = (session?.user as any)?.role as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role !== "SELLER") {
    return NextResponse.json(
      { error: "Only sellers can manage offers" },
      { status: 403 }
    );
  }

  const { id: offerId } = await params;

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    select: {
      id: true,
      status: true,
      listing: { select: { sellerId: true } },
    },
  });

  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  if (offer.listing.sellerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (offer.status !== "PENDING") {
    return NextResponse.json(
      { error: "Only pending offers can be updated" },
      { status: 400 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const newStatus = parsed.data.action === "ACCEPT" ? "ACCEPTED" : "DECLINED";

  await prisma.offer.update({
    where: { id: offerId },
    data: { status: newStatus },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, status: newStatus });
}
