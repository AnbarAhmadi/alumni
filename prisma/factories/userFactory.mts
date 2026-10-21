// User factory: fake but realistic rows for the users table (see ddd.md and
// prisma/schema.prisma). Only for the development seed: every person is made up,
// and every email ends in @example.com, a domain reserved for examples.
import { fakerTR as faker } from "@faker-js/faker";

// Fixed seed and reference date, so every run creates exactly the same rows.
const SEED = 2026;
const REF_DATE = new Date("2026-10-01T09:00:00.000Z");
const REF_YEAR = REF_DATE.getUTCFullYear();

const SCHOOLS = [
  "Istanbul University",
  "Istanbul Technical University",
  "Boğaziçi University",
  "Marmara University",
  "Yıldız Technical University",
];

export type UserSeed = {
  fullName: string;
  email: string;
  age: number;
  school: string | null;
  isAlumni: boolean;
  graduationYear: number | null;
};

// "Şükrü Çağlar" -> "sukru.caglar": plain ASCII for the email address.
function emailPart(text: string) {
  return text
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .normalize("NFD").replace(/[^a-z0-9]/g, "");
}

export function buildUsers(count: number): UserSeed[] {
  faker.seed(SEED);
  faker.setDefaultRefDate(REF_DATE);
  const usedEmails = new Set<string>();

  return Array.from({ length: count }, () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    // Emails must be unique (ignoring case): add a number if the name is taken.
    const base = `${emailPart(firstName)}.${emailPart(lastName)}`;
    let email = `${base}@example.com`;
    for (let n = 2; usedEmails.has(email); n++) email = `${base}${n}@example.com`;
    usedEmails.add(email);

    // Graduates are older than current students. graduationYear is set only for graduates.
    const isAlumni = faker.datatype.boolean({ probability: 0.6 });
    const age = isAlumni ? faker.number.int({ min: 22, max: 45 }) : faker.number.int({ min: 18, max: 25 });
    const graduationAge = Math.min(age, faker.number.int({ min: 22, max: 24 }));
    const graduationYear = isAlumni ? REF_YEAR - (age - graduationAge) : null;

    // school is optional, so some users have none.
    const school = faker.datatype.boolean({ probability: 0.85 }) ? faker.helpers.arrayElement(SCHOOLS) : null;

    return { fullName: `${firstName} ${lastName}`, email, age, school, isAlumni, graduationYear };
  });
}
