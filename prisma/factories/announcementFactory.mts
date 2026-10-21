// Announcement factory: fake but realistic rows for the announcements table
// (see ddd.md and prisma/schema.prisma). Only for the development seed.
import { fakerEN, fakerTR } from "@faker-js/faker";

// Fixed seed and reference date, so every run creates exactly the same rows.
const SEED = 2026;
const REF_DATE = new Date("2026-10-01T09:00:00.000Z");

export type AnnouncementSeed = {
  title: string;
  message: string;
  postedAt: Date;
};

// Turkish city names come from the Turkish locale; job titles and company
// names from the English one, because the Turkish locale has none.
const TEMPLATES: (() => Omit<AnnouncementSeed, "postedAt">)[] = [
  () => {
    const city = fakerTR.location.city();
    return {
      title: `Alumni meetup in ${city}`,
      message: `Graduates living in or near ${city} are invited to an evening of networking. Current students are welcome too.`,
    };
  },
  () => {
    const job = fakerEN.person.jobTitle();
    return {
      title: `Career talk: working as a ${job}`,
      message: `One of our graduates, now a ${job}, will talk about their first years after graduation and answer questions.`,
    };
  },
  () => ({
    title: "Mentors wanted",
    message: "We are looking for graduates who would like to mentor a current MIS student for one semester, about one hour a month.",
  }),
  () => {
    const year = fakerTR.number.int({ min: 2010, max: 2020 });
    return {
      title: `Reunion of the class of ${year}`,
      message: `The class of ${year} meets again on campus. Please check that your contact details in the system are up to date.`,
    };
  },
  () => {
    const company = fakerEN.company.name();
    return {
      title: `Internship openings at ${company}`,
      message: `${company}, where several of our graduates work, has internship openings for third- and fourth-year MIS students.`,
    };
  },
  () => ({
    title: "Update your profile",
    message: "Please keep your email and graduation details current so the department can stay in touch with you.",
  }),
];

export function buildAnnouncements(count: number): AnnouncementSeed[] {
  if (count > TEMPLATES.length) throw new Error(`At most ${TEMPLATES.length} announcements (one per template).`);

  for (const faker of [fakerEN, fakerTR]) {
    faker.seed(SEED);
    faker.setDefaultRefDate(REF_DATE);
  }

  // Different templates for every announcement, posted at some point in the year before REF_DATE.
  const templates = fakerEN.helpers.shuffle(TEMPLATES).slice(0, count);
  const rows = templates.map((make) => ({ ...make(), postedAt: fakerEN.date.past({ years: 1 }) }));

  // Oldest first, like a real list of posts.
  return rows.sort((a, b) => a.postedAt.getTime() - b.postedAt.getTime());
}
