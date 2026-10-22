// Job posting factory: fake but realistic rows for the job_postings table
// (see ddd.md and prisma/schema.prisma). Only for the development seed.
import { fakerEN, fakerTR } from "@faker-js/faker";

// Fixed seed and reference date, so every run creates exactly the same rows.
const SEED = 2026;
const REF_DATE = new Date("2026-10-01T09:00:00.000Z");

export type JobPostingSeed = {
  userId: number;
  title: string;
  company: string;
  city: string | null;
  description: string | null;
  createdAt: Date;
};

const TITLES = [
  "Junior Data Analyst",
  "Business Analyst",
  "ERP Consultant",
  "IT Project Assistant",
  "Junior Software Developer",
  "Database Administrator",
  "Systems Analyst",
  "Digital Marketing Specialist",
  "Information Security Intern",
  "Product Owner",
];

const CITIES = ["Istanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Kocaeli"];

// Gives every user in `userIds` 2 or 3 postings, posted in the 3 months before REF_DATE.
export function buildJobPostings(userIds: number[]): JobPostingSeed[] {
  for (const faker of [fakerEN, fakerTR]) {
    faker.seed(SEED);
    faker.setDefaultRefDate(REF_DATE);
  }

  return userIds.flatMap((userId) =>
    Array.from({ length: fakerEN.number.int({ min: 2, max: 3 }) }, () => {
      const title = fakerEN.helpers.arrayElement(TITLES);
      const company = fakerEN.company.name();
      // city and description are optional, so some postings have none.
      const city = fakerEN.datatype.boolean({ probability: 0.85 }) ? fakerEN.helpers.arrayElement(CITIES) : null;
      const description = fakerEN.datatype.boolean({ probability: 0.75 })
        ? `${company} is looking for a ${title.toLowerCase()} to join its team${city ? ` in ${city}` : ""}. ` +
          `Graduates of MIS and related programs are welcome. Experience with ${fakerEN.helpers.arrayElement(["SQL", "Excel", "Power BI", "SAP", "Python", "Jira"])} is a plus.`
        : null;
      return { userId, title, company, city, description, createdAt: fakerEN.date.recent({ days: 90 }) };
    }),
  );
}
