import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  email: z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(10000),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, ticketId: ticket.id });
}
