import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  let settings = await prisma.settings.findUnique({
    where: { userId: user.id },
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: { userId: user.id, hourlyRate: 14.0 },
    });
  }

  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const { hourlyRate } = await req.json();

    if (typeof hourlyRate !== "number" || hourlyRate < 0) {
      return NextResponse.json(
        { error: "Valid hourly rate is required" },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.upsert({
      where: { userId: user.id },
      update: { hourlyRate },
      create: { userId: user.id, hourlyRate },
    });

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
