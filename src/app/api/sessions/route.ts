import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized } from "@/lib/session";

const MIN_SESSION_MINUTES = 20;

function isSessionTooShort(startedAt: Date, endedAt: Date): boolean {
  const diffMs = endedAt.getTime() - startedAt.getTime();
  return diffMs < MIN_SESSION_MINUTES * 60 * 1000;
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  const limit = url.searchParams.get("limit");

  const where: Record<string, unknown> = { userId: user.id };

  if (start || end) {
    where.startedAt = {};
    if (start) (where.startedAt as Record<string, unknown>).gte = new Date(start);
    if (end) (where.startedAt as Record<string, unknown>).lte = new Date(end);
  }

  const sessions = await prisma.workSession.findMany({
    where,
    orderBy: { startedAt: "desc" },
    ...(limit ? { take: parseInt(limit) } : {}),
  });

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const { startedAt, endedAt, note, tipAmount } = body;

    if (!startedAt) {
      return NextResponse.json(
        { error: "startedAt is required" },
        { status: 400 }
      );
    }

    // If both startedAt and endedAt provided (manual session), validate minimum duration
    if (endedAt) {
      const start = new Date(startedAt);
      const end = new Date(endedAt);
      if (isSessionTooShort(start, end)) {
        return NextResponse.json(
          { error: "too_short", message: "Session must be at least 20 minutes" },
          { status: 400 }
        );
      }
    }

    const session = await prisma.workSession.create({
      data: {
        userId: user.id,
        startedAt: new Date(startedAt),
        endedAt: endedAt ? new Date(endedAt) : null,
        note: note || null,
        tipAmount: tipAmount ? parseFloat(tipAmount) : 0,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const { id, startedAt, endedAt, tipAmount, note } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.workSession.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Check duration (warn but don't block)
    const effectiveStart = startedAt ? new Date(startedAt) : existing.startedAt;
    const effectiveEnd = endedAt ? new Date(endedAt) : existing.endedAt;
    const tooShort = effectiveEnd ? isSessionTooShort(effectiveStart, effectiveEnd) : false;

    const updateData: Record<string, unknown> = {};
    if (startedAt !== undefined) updateData.startedAt = new Date(startedAt);
    if (endedAt !== undefined) updateData.endedAt = endedAt ? new Date(endedAt) : null;
    if (tipAmount !== undefined) updateData.tipAmount = parseFloat(tipAmount) || 0;
    if (note !== undefined) updateData.note = note || null;

    const session = await prisma.workSession.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ...session, warning: tooShort ? "too_short" : undefined });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const existing = await prisma.workSession.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  await prisma.workSession.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
