// Application factory: fake rows for the applications table (see ddd.md and
// prisma/schema.prisma). Only for the development seed.
import { fakerEN } from "@faker-js/faker";

// Fixed seed and reference date, so every run creates exactly the same rows.
const SEED = 2026;
const REF_DATE = new Date("2026-10-01T09:00:00.000Z");

export type ApplicationSeed = {
  userId: number;
  jobPostingId: number;
  createdAt: Date;
  // status is left out: the database default "applied" is the only value defined in ddd.md.
};

type Posting = { id: number; userId: number; createdAt: Date };

// Picks `count` different (user, posting) pairs at random. A pair is never used
// twice (the table's unique pair), and nobody applies to their own posting.
export function buildApplications(userIds: number[], postings: Posting[], count: number): ApplicationSeed[] {
  fakerEN.seed(SEED);
  fakerEN.setDefaultRefDate(REF_DATE);

  const possible = userIds.flatMap((userId) =>
    postings.filter((posting) => posting.userId !== userId).map((posting) => ({ userId, posting })),
  );
  if (count > possible.length) throw new Error(`Only ${possible.length} different user/posting pairs are possible.`);

  return fakerEN.helpers.arrayElements(possible, count).map(({ userId, posting }) => ({
    userId,
    jobPostingId: posting.id,
    // Applied some time between the posting date and REF_DATE.
    createdAt: fakerEN.date.between({ from: posting.createdAt, to: REF_DATE }),
  }));
}
