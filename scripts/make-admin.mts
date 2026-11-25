// Makes an existing user an ADMIN (Week 10): npm run make-admin -- <email>
// The way to create the first admin: register on /register, then run this with that email.
// It only promotes, so it can never break the safety rules (ddd.md). It reads only the
// user's id, name, email and role: never the password hash.
//
// Uses Prisma Client with the PostgreSQL adapter, like the seed (prisma/seed.mts), and
// DATABASE_URL from .env. Node 24 runs this .mts file directly.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.mts";

const USAGE = "Usage: npm run make-admin -- <email>";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error(`No email given. ${USAGE}`);
  process.exit(1);
}

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
const SELECT = { id: true, fullName: true, email: true, role: true } as const;

try {
  // Emails are stored in lowercase (ddd.md), so the lowercased email finds the user.
  const user = await prisma.user.findUnique({ where: { email }, select: SELECT });
  if (!user) {
    console.error(`No user has the email "${email}". Register on /register first, then run this again. ${USAGE}`);
    process.exitCode = 1;
  } else if (user.role === "ADMIN") {
    console.log(`${user.fullName} (${user.email}, id ${user.id}) is already an admin. Nothing changed.`);
  } else {
    const updated = await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" }, select: SELECT });
    console.log(`${updated.fullName} (${updated.email}, id ${updated.id}) is now an admin (was ${user.role}).`);
  }
} catch (err) {
  // Only the message (Prisma's messages can include a query's arguments, never printed here).
  console.error(`Could not make an admin: ${err instanceof Error ? err.message.split("\n")[0] : String(err)}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
