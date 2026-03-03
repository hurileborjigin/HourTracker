import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create user (or find existing)
  const passwordHash = await bcrypt.hash("Huson732837!", 10);

  const user = await prisma.user.upsert({
    where: { email: "hurile.borjigin@icloud.com" },
    update: {},
    create: {
      name: "Hurile Borjigin",
      email: "hurile.borjigin@icloud.com",
      passwordHash,
    },
  });

  // Create settings
  await prisma.settings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      hourlyRate: 14.0,
    },
  });

  console.log(`Found/created user: ${user.name ?? user.email} (${user.id})`);

  // All timesheet sessions (Europe/Berlin CET = UTC+1)
  const sessions: { date: string; inTime: string; outTime: string }[] = [
    // === Timesheet 1: 07/12/25 – 04/01/26 ===
    { date: "2025-12-07", inTime: "14:00", outTime: "20:00" },
    { date: "2025-12-12", inTime: "09:00", outTime: "20:00" },
    { date: "2025-12-14", inTime: "13:30", outTime: "20:00" },
    { date: "2025-12-19", inTime: "09:00", outTime: "20:00" },
    { date: "2025-12-22", inTime: "09:00", outTime: "20:30" },
    { date: "2025-12-23", inTime: "09:00", outTime: "20:30" },
    { date: "2025-12-29", inTime: "09:15", outTime: "20:00" },
    { date: "2025-12-30", inTime: "09:00", outTime: "20:00" },
    { date: "2025-12-31", inTime: "09:00", outTime: "19:30" },
    { date: "2026-01-01", inTime: "11:00", outTime: "19:30" },
    { date: "2026-01-02", inTime: "09:00", outTime: "20:00" },
    { date: "2026-01-04", inTime: "09:00", outTime: "18:30" },

    // === Timesheet 2: 06/01/26 – 01/02/26 ===
    { date: "2026-01-06", inTime: "09:00", outTime: "19:30" },
    { date: "2026-01-09", inTime: "09:00", outTime: "19:30" },
    { date: "2026-01-10", inTime: "14:00", outTime: "20:00" },
    { date: "2026-01-11", inTime: "14:00", outTime: "19:30" },
    { date: "2026-01-16", inTime: "09:00", outTime: "19:30" },
    { date: "2026-01-17", inTime: "14:00", outTime: "20:00" },
    { date: "2026-01-18", inTime: "14:00", outTime: "19:00" },
    { date: "2026-01-23", inTime: "09:00", outTime: "20:00" },
    { date: "2026-01-30", inTime: "09:00", outTime: "19:30" },
    { date: "2026-01-31", inTime: "09:00", outTime: "20:00" },
    { date: "2026-02-01", inTime: "09:00", outTime: "19:00" },

    // === Timesheet 3: 06/02/26 – 01/03/26 ===
    { date: "2026-02-06", inTime: "09:00", outTime: "19:00" },
    { date: "2026-02-07", inTime: "09:00", outTime: "19:30" },
    { date: "2026-02-08", inTime: "14:00", outTime: "19:00" },
    { date: "2026-02-13", inTime: "09:00", outTime: "19:30" },
    { date: "2026-02-14", inTime: "09:30", outTime: "20:00" },
    { date: "2026-02-15", inTime: "14:00", outTime: "18:30" },
    { date: "2026-02-18", inTime: "14:00", outTime: "20:00" },
    { date: "2026-02-20", inTime: "09:20", outTime: "20:00" },
    { date: "2026-02-21", inTime: "12:00", outTime: "19:30" },
    { date: "2026-02-22", inTime: "09:10", outTime: "19:00" },
    { date: "2026-02-27", inTime: "09:20", outTime: "19:00" },
    { date: "2026-02-28", inTime: "09:15", outTime: "19:00" },
    { date: "2026-03-01", inTime: "13:00", outTime: "18:30" },
  ];

  // Delete any previously seeded sessions for this user (idempotent)
  const deleted = await prisma.workSession.deleteMany({ where: { userId: user.id } });
  if (deleted.count > 0) {
    console.log(`  Cleared ${deleted.count} existing sessions`);
  }

  // Insert all sessions
  for (const s of sessions) {
    const startedAt = new Date(`${s.date}T${s.inTime}:00+01:00`);
    const endedAt = new Date(`${s.date}T${s.outTime}:00+01:00`);

    await prisma.workSession.create({
      data: {
        userId: user.id,
        startedAt,
        endedAt,
        note: "The Victorian House",
      },
    });
  }

  const count = await prisma.workSession.count({ where: { userId: user.id } });
  console.log(`✅ Seeded ${count} work sessions for ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
