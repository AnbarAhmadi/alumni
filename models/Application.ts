// Application model: the Application type, the validation rules and the CRUD
// functions for the PostgreSQL "applications" table, through Prisma Client
// (lib/prisma.ts). It has no HTTP or Next.js code. See ddd.md.
//
// An application links one user to one job posting (many-to-many between users
// and postings). A user can apply to the same posting only once: the database's
// unique pair (userId, jobPostingId) decides, and a duplicate gives a ConflictError.
import { prisma } from "@/lib/prisma";
import { ConflictError, ValidationError } from "./User";

export { ConflictError, ValidationError };

export type Application = {
  id: number;
  userId: number;
  jobPostingId: number;
  status: string;
  createdAt: string; // ISO date, set by the database
};

export type ApplicationFields = Pick<Application, "userId" | "jobPostingId" | "status">;

// An application with the applicant's name (GET /api/jobs/:id/applications).
export type ApplicationWithUser = Application & { user: { id: number; fullName: string } };

// An application with the posting's title and company (GET /api/users/:id/applications).
export type ApplicationWithJobPosting = Application & { jobPosting: { id: number; title: string; company: string } };

// Raw input from a request body or form. Unknown keys (including "id" and "createdAt") are ignored.
export type ApplicationInput = Record<string, unknown>;

// ---------- Database rows ----------

const SELECT = { id: true, userId: true, jobPostingId: true, status: true, createdAt: true } as const;

type Row = { id: number; userId: number; jobPostingId: number; status: string; createdAt: Date };

function toApplication(row: Row): Application {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

// Ids that can't exist in an integer column match nothing (instead of a database error).
function isValidId(id: number) {
  return Number.isInteger(id) && id > 0 && id <= 2_147_483_647;
}

type PrismaError = { code?: string };

function errorCode(err: unknown) {
  return typeof err === "object" && err !== null ? (err as PrismaError).code : undefined;
}

// ---------- Validation ----------

const FIELDS = ["userId", "jobPostingId", "status"] as const;

// Checks the fields in `input`. `required` lists fields that must be present;
// any other field is checked only if it was sent. Returns only the known, cleaned fields.
// Whether the user and the posting exist, and whether the pair is new, is decided by the database.
function validate(input: ApplicationInput, required: readonly (keyof ApplicationFields)[]): Partial<ApplicationFields> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ValidationError("Request body must be an object.");
  }

  for (const field of required) {
    if (input[field] === undefined) throw new ValidationError(`"${field}" is required.`, field);
  }

  const data: Partial<ApplicationFields> = {};

  for (const field of ["userId", "jobPostingId"] as const) {
    const value = input[field];
    if (value === undefined) continue;
    if (typeof value !== "number" || !isValidId(value)) {
      throw new ValidationError(`"${field}" must be a positive whole number.`, field);
    }
    data[field] = value;
  }

  // Only "applied" (the default) is defined in ddd.md so far; other values are not decided yet.
  if (input.status !== undefined) {
    if (typeof input.status !== "string" || input.status.trim() === "") {
      throw new ValidationError('"status" must be a non-empty string.', "status");
    }
    data.status = input.status.trim();
  }

  return data;
}

// Runs a write and turns the database's errors into clear ones:
// P2002 = the user already applied to this posting, P2003 = the user or the posting doesn't exist.
async function write<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (err) {
    const code = errorCode(err);
    if (code === "P2002") throw new ConflictError("This user has already applied to this job posting.", "jobPostingId");
    if (code === "P2003") throw new ValidationError('"userId" and "jobPostingId" must be the ids of an existing user and job posting.');
    throw err;
  }
}

// ---------- CRUD ----------

export const ApplicationModel = {
  async getAll(): Promise<Application[]> {
    const rows = await prisma.application.findMany({ select: SELECT, orderBy: { id: "asc" } });
    return rows.map(toApplication);
  },

  // The applications to one posting, with each applicant's name, in one Prisma call.
  async getAllByJobPosting(jobPostingId: number): Promise<ApplicationWithUser[]> {
    if (!isValidId(jobPostingId)) return [];
    const rows = await prisma.application.findMany({
      where: { jobPostingId },
      select: { ...SELECT, user: { select: { id: true, fullName: true } } },
      orderBy: { id: "asc" },
    });
    return rows.map(({ user, ...row }) => ({ ...toApplication(row), user }));
  },

  // The applications of one user, with each posting's title and company, in one Prisma call.
  async getAllByUser(userId: number): Promise<ApplicationWithJobPosting[]> {
    if (!isValidId(userId)) return [];
    const rows = await prisma.application.findMany({
      where: { userId },
      select: { ...SELECT, jobPosting: { select: { id: true, title: true, company: true } } },
      orderBy: { id: "asc" },
    });
    return rows.map(({ jobPosting, ...row }) => ({ ...toApplication(row), jobPosting }));
  },

  async getById(id: number): Promise<Application | null> {
    if (!isValidId(id)) return null;
    const row = await prisma.application.findUnique({ where: { id }, select: SELECT });
    return row ? toApplication(row) : null;
  },

  // userId and jobPostingId are required; status defaults to "applied" in the database.
  async create(data: ApplicationInput): Promise<Application> {
    const fields = validate(data, ["userId", "jobPostingId"]) as ApplicationFields;
    const row = await write(() => prisma.application.create({ data: fields, select: SELECT }));
    return toApplication(row);
  },

  // Changes only the fields sent (usually status). Returns null if no application has this id.
  async update(id: number, partialData: ApplicationInput): Promise<Application | null> {
    if (!(await this.getById(id))) return null;

    const fields = validate(partialData, []);
    if (Object.keys(fields).length === 0) {
      throw new ValidationError(`Send at least one of: ${FIELDS.join(", ")}.`);
    }

    const row = await write(() => prisma.application.update({ where: { id }, data: fields, select: SELECT }));
    return toApplication(row);
  },

  // Replaces the application: userId and jobPostingId are required; status goes back to
  // "applied" if it isn't sent. Returns null if no application has this id.
  async replace(id: number, fullData: ApplicationInput): Promise<Application | null> {
    if (!(await this.getById(id))) return null;

    const fields = validate(fullData, ["userId", "jobPostingId"]) as ApplicationFields;
    const data = { ...fields, status: fields.status ?? "applied" };
    const row = await write(() => prisma.application.update({ where: { id }, data, select: SELECT }));
    return toApplication(row);
  },

  // Returns false if no application has this id.
  async remove(id: number): Promise<boolean> {
    if (!isValidId(id)) return false;
    const { count } = await prisma.application.deleteMany({ where: { id } });
    return count > 0;
  },
};
