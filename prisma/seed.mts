// Development seed: empties both tables, then inserts 20 fake users and
// 5 fake announcements from the factories. Running it again gives the same
// result (same rows, ids starting at 1 again), never duplicates.
//
// Run with: npx prisma db seed   (configured in prisma.config.ts)
// Uses Prisma Client with the PostgreSQL adapter. The app itself does not use
// the database yet; it still keeps its data in memory.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.mts";
import { buildAnnouncements } from "./factories/announcementFactory.mts";
import { buildUsers } from "./factories/userFactory.mts";

const USER_COUNT = 20;
const ANNOUNCEMENT_COUNT = 5;

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed: NODE_ENV is production. The seed deletes all users and announcements.");
  process.exit(1);
}

// `npx prisma db seed` already has the variables from .env (loaded in prisma.config.ts);
// load .env here too so `node prisma/seed.mts` also works on its own.
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env");
  } catch {
    // No .env: handled just below.
  }
}
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env first.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

try {
  const users = buildUsers(USER_COUNT);
  const announcements = buildAnnouncements(ANNOUNCEMENT_COUNT);

  // One transaction: either the tables are emptied AND filled, or nothing changes.
  const [, insertedUsers, insertedAnnouncements] = await prisma.$transaction([
    prisma.$executeRaw`TRUNCATE TABLE "users", "announcements" RESTART IDENTITY`,
    prisma.user.createMany({ data: users }),
    prisma.announcement.createMany({ data: announcements }),
  ]);

  console.log(`Seeded ${insertedUsers.count} users and ${insertedAnnouncements.count} announcements.`);
} finally {
  await prisma.$disconnect();
}
