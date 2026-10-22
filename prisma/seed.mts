// Development seed: empties all tables, then inserts from the factories:
//   20 fake users, 5 fake announcements,
//   2 or 3 job postings for each of the first 10 users (the other 10 get none),
//   30 applications between random users and postings (never the same pair twice).
// Running it again gives the same result (same rows, ids starting at 1 again), never duplicates.
//
// Run with: npx prisma db seed   (configured in prisma.config.ts)
// Uses Prisma Client with the PostgreSQL adapter, like the app (lib/prisma.ts).
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.mts";
import { buildAnnouncements } from "./factories/announcementFactory.mts";
import { buildApplications } from "./factories/applicationFactory.mts";
import { buildJobPostings } from "./factories/jobPostingFactory.mts";
import { buildUsers } from "./factories/userFactory.mts";

const USER_COUNT = 20;
const ANNOUNCEMENT_COUNT = 5;
const USERS_WITH_POSTINGS = 10;
const APPLICATION_COUNT = 30;

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
  // One transaction: either the tables are emptied AND filled, or nothing changes.
  const counts = await prisma.$transaction(async (tx) => {
    // Applications first, then job postings, then the other tables, and the id counters
    // are reset. PostgreSQL only lets a referenced table (users, job_postings) be emptied
    // in the same TRUNCATE as the tables that point to it, so it is one statement.
    await tx.$executeRaw`TRUNCATE TABLE "applications", "job_postings", "users", "announcements" RESTART IDENTITY`;

    const users = await tx.user.createManyAndReturn({ data: buildUsers(USER_COUNT), select: { id: true } });
    const announcements = await tx.announcement.createMany({ data: buildAnnouncements(ANNOUNCEMENT_COUNT) });

    const userIds = users.map((u) => u.id);
    const postings = await tx.jobPosting.createManyAndReturn({
      data: buildJobPostings(userIds.slice(0, USERS_WITH_POSTINGS)),
      select: { id: true, userId: true, createdAt: true },
    });
    const applications = await tx.application.createMany({
      data: buildApplications(userIds, postings, APPLICATION_COUNT),
    });

    return { users: users.length, announcements: announcements.count, postings: postings.length, applications: applications.count };
  });

  console.log(
    `Seeded ${counts.users} users, ${counts.announcements} announcements, ` +
      `${counts.postings} job postings and ${counts.applications} applications.`,
  );
} finally {
  await prisma.$disconnect();
}
