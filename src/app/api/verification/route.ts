import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const bodySchema = z.object({
  type: z.enum(["SELLER", "BUYER"]),
  details: z.string().min(10).max(10000),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const request = await prisma.verificationRequest.create({
    data: {
      userId,
      type: parsed.data.type,
      details: parsed.data.details,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, requestId: request.id });
}
