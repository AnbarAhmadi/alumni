// One shared Prisma Client for the models, connected to PostgreSQL through the
// pg adapter. DATABASE_URL comes from .env (npm run dev) or from
// docker-compose.yml (inside Docker).
//
// The client is kept on globalThis in development, so Next.js hot reloads reuse
// it instead of opening a new connection pool on every reload.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client.mts";

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

function createClient() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
