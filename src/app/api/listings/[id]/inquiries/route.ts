import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const bodySchema = z.object({
  message: z.string().min(1).max(4000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: listingId } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, status: true, sellerId: true },
  });

  if (!listing || listing.status !== "ACTIVE") {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.sellerId === userId) {
    return NextResponse.json(
      { error: "You can't inquire on your own listing" },
      { status: 400 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      listingId,
      buyerId: userId,
      message: parsed.data.message,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, inquiryId: inquiry.id });
}
