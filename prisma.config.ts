// Prisma CLI settings for migrations (npx prisma migrate dev / status) and the seed (npx prisma db seed).
// The app reads and writes the database through Prisma Client (lib/prisma.ts).
//
// Prisma 7 does not read .env by itself, so the file is loaded here with
// Node's built-in process.loadEnvFile() (no dotenv package needed).
import { defineConfig } from "prisma/config";

try {
  process.loadEnvFile(".env");
} catch {
  // No .env file: DATABASE_URL must then be set in the shell.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // `npx prisma db seed` runs this. Node 24 runs the .mts file directly (no tsx needed).
    seed: "node prisma/seed.mts",
  },
  datasource: {
    // Points at the Docker database from this computer (localhost:5432); see .env.example.
    // Read with process.env (not env()) so `prisma generate` also works without it,
    // for example in the Docker build. Migrate and seed commands still need it.
    url: process.env.DATABASE_URL,
  },
});
