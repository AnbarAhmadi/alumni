-- Week 10: roles and passwords for users (ddd.md, Roles and Register rules).
-- Adds the Role enum, users.role and users.passwordHash, and makes users.age optional
-- (the register page doesn't ask for it). The existing rows are filled in first,
-- so passwordHash can be NOT NULL.

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ALUMNI', 'STUDENT');

-- AlterTable: passwordHash starts nullable so the existing rows can be filled in.
ALTER TABLE "users" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT',
ALTER COLUMN "age" DROP NOT NULL;

-- Existing users: user 1 is the admin; the others are ALUMNI if they graduated, else STUDENT.
UPDATE "users" SET "role" = CASE
  WHEN "id" = 1 THEN 'ADMIN'::"Role"
  WHEN "isAlumni" THEN 'ALUMNI'::"Role"
  ELSE 'STUDENT'::"Role"
END;

-- Existing users all get the bcrypt hash of the DEMO-ONLY password "homecoming-demo"
-- (the same hash as prisma/seed.mts). Development data only; never use it for real accounts.
UPDATE "users" SET "passwordHash" = '$2b$10$HomecomingDemoSeedSale7m190f8/D8mVuHaagZmng4J7yKHaONy';

ALTER TABLE "users" ALTER COLUMN "passwordHash" SET NOT NULL;
