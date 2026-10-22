// JobPosting model: the JobPosting type, the validation rules and the CRUD
// functions for the PostgreSQL "job_postings" table, through Prisma Client
// (lib/prisma.ts). It has no HTTP or Next.js code. See ddd.md.
//
// Each posting belongs to exactly one user (userId). Deleting the user deletes
// their postings in the database (ON DELETE CASCADE).
import { prisma } from "@/lib/prisma";
import { ValidationError } from "./User";

export { ValidationError };

export type JobPosting = {
  id: number;
  userId: number;
  title: string;
  company: string;
  city?: string;
  description?: string;
  createdAt: string; // ISO date, set by the database
};

export type JobPostingFields = Omit<JobPosting, "id" | "createdAt">;

// Raw input from a request body or form. Unknown keys (including "id" and "createdAt") are ignored.
export type JobPostingInput = Record<string, unknown>;

// ---------- Database rows ----------

const SELECT = {
  id: true, userId: true, title: true, company: true, city: true, description: true, createdAt: true,
} as const;

type Row = {
  id: number; userId: number; title: string; company: string;
  city: string | null; description: string | null; createdAt: Date;
};

// Empty optional fields are left out of the result (never null), like in the other models.
function toJobPosting(row: Row): JobPosting {
  const { city, description, createdAt, ...rest } = row;
  return {
    ...rest,
    ...(city !== null && { city }),
    ...(description !== null && { description }),
    createdAt: createdAt.toISOString(),
  };
}

// Ids that can't exist in an integer column match nothing (instead of a database error).
function isValidId(id: number) {
  return Number.isInteger(id) && id > 0 && id <= 2_147_483_647;
}

// Prisma reports a broken foreign key (here: no user with this userId) as P2003.
function isMissingUserError(err: unknown) {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "P2003";
}

// ---------- Validation ----------

const FIELDS = ["userId", "title", "company", "city", "description"] as const;
const TEXT_FIELDS = ["title", "company", "city", "description"] as const;

// Checks the fields in `input`. `required` lists fields that must be present;
// any other field is checked only if it was sent. Returns only the known, cleaned fields.
// Whether the user exists is decided by the database (the foreign key), see write below.
function validate(input: JobPostingInput, required: readonly (keyof JobPostingFields)[]): Partial<JobPostingFields> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ValidationError("Request body must be an object.");
  }

  for (const field of required) {
    if (input[field] === undefined) throw new ValidationError(`"${field}" is required.`, field);
  }

  const data: Partial<JobPostingFields> = {};

  if (input.userId !== undefined) {
    const userId = input.userId;
    if (typeof userId !== "number" || !isValidId(userId)) {
      throw new ValidationError('"userId" must be a positive whole number.', "userId");
    }
    data.userId = userId;
  }

  for (const field of TEXT_FIELDS) {
    const value = input[field];
    if (value === undefined) continue;
    if (typeof value !== "string" || value.trim() === "") {
      throw new ValidationError(`"${field}" must be a non-empty string.`, field);
    }
    data[field] = value.trim();
  }

  return data;
}

// Runs a write and turns the database's foreign-key error into a ValidationError.
async function write<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (err) {
    if (isMissingUserError(err)) throw new ValidationError('"userId" must be the id of an existing user.', "userId");
    throw err;
  }
}

// ---------- CRUD ----------

export const JobPostingModel = {
  async getAll(): Promise<JobPosting[]> {
    const rows = await prisma.jobPosting.findMany({ select: SELECT, orderBy: { id: "asc" } });
    return rows.map(toJobPosting);
  },

  // The postings of one user, oldest first. An unknown user simply has none.
  async getAllByUser(userId: number): Promise<JobPosting[]> {
    if (!isValidId(userId)) return [];
    const rows = await prisma.jobPosting.findMany({ where: { userId }, select: SELECT, orderBy: { id: "asc" } });
    return rows.map(toJobPosting);
  },

  async getById(id: number): Promise<JobPosting | null> {
    if (!isValidId(id)) return null;
    const row = await prisma.jobPosting.findUnique({ where: { id }, select: SELECT });
    return row ? toJobPosting(row) : null;
  },

  // userId, title and company are required; city and description are optional.
  async create(data: JobPostingInput): Promise<JobPosting> {
    const fields = validate(data, ["userId", "title", "company"]) as JobPostingFields;
    const row = await write(() => prisma.jobPosting.create({ data: fields, select: SELECT }));
    return toJobPosting(row);
  },

  // Changes only the fields sent. Returns null if no posting has this id.
  async update(id: number, partialData: JobPostingInput): Promise<JobPosting | null> {
    if (!(await this.getById(id))) return null;

    const fields = validate(partialData, []);
    if (Object.keys(fields).length === 0) {
      throw new ValidationError(`Send at least one of: ${FIELDS.join(", ")}.`);
    }

    const row = await write(() => prisma.jobPosting.update({ where: { id }, data: fields, select: SELECT }));
    return toJobPosting(row);
  },

  // Replaces the posting: userId, title and company are required; city and
  // description are removed if they aren't sent. Returns null if no posting has this id.
  async replace(id: number, fullData: JobPostingInput): Promise<JobPosting | null> {
    if (!(await this.getById(id))) return null;

    const fields = validate(fullData, ["userId", "title", "company"]) as JobPostingFields;
    const data = { ...fields, city: fields.city ?? null, description: fields.description ?? null };
    const row = await write(() => prisma.jobPosting.update({ where: { id }, data, select: SELECT }));
    return toJobPosting(row);
  },

  // Returns false if no posting has this id. Its applications are deleted too (ON DELETE CASCADE).
  async remove(id: number): Promise<boolean> {
    if (!isValidId(id)) return false;
    const { count } = await prisma.jobPosting.deleteMany({ where: { id } });
    return count > 0;
  },
};
