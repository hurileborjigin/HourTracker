import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized } from "@/lib/session";

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
    const { startedAt, endedAt, note } = body;

    if (!startedAt) {
      return NextResponse.json(
        { error: "startedAt is required" },
        { status: 400 }
      );
    }

    const session = await prisma.workSession.create({
      data: {
        userId: user.id,
        startedAt: new Date(startedAt),
        endedAt: endedAt ? new Date(endedAt) : null,
        note: note || null,
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
    const { id, endedAt } = await req.json();

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

    const session = await prisma.workSession.update({
      where: { id },
      data: { endedAt: endedAt ? new Date(endedAt) : null },
    });

    return NextResponse.json(session);
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
