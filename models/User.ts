// User model: the User type, the validation rules and the CRUD functions.
// The data lives in the PostgreSQL "users" table and is read and written
// through Prisma Client (lib/prisma.ts). It has no HTTP or Next.js code.
//
// The table also has isAlumni and graduationYear (see ddd.md). The app doesn't
// use them yet: new users get the database defaults (false and empty).
import { prisma } from "@/lib/prisma";
import type { JobPosting } from "./JobPosting";

export type User = {
  id: number;
  fullName: string;
  email: string;
  age: number;
  school?: string;
};

export type UserFields = Omit<User, "id">;

// A user with their job postings, for GET /api/users/:id.
export type UserWithJobs = User & { jobs: JobPosting[] };

// Raw input from a request body or form. Unknown keys (including "id") are ignored.
export type UserInput = Record<string, unknown>;

export class ValidationError extends Error {
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

// Thrown when the database refuses a value because it must be unique
// (today only email, through the unique index users_email_key). The API answers 409.
export class ConflictError extends Error {
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ConflictError";
    this.field = field;
  }
}

// ---------- Database rows ----------

// Only these columns are read, in the same order as the User type.
const SELECT = { id: true, fullName: true, email: true, age: true, school: true } as const;

type Row = { id: number; fullName: string; email: string; age: number; school: string | null };

// Only the columns the app uses (include returns every column, e.g. isAlumni too).
function pick(row: Row): Row {
  return { id: row.id, fullName: row.fullName, email: row.email, age: row.age, school: row.school };
}

// An empty school is left out of the result (never null), as before.
function toUser(row: Row): User {
  const { school, ...rest } = row;
  return school === null ? rest : { ...rest, school };
}

// The user's job postings, loaded together with the user (see getByIdWithJobs).
const JOBS = {
  select: { id: true, userId: true, title: true, company: true, city: true, description: true, createdAt: true },
  orderBy: { id: "asc" },
} as const;

type JobRow = {
  id: number; userId: number; title: string; company: string;
  city: string | null; description: string | null; createdAt: Date;
};

// Same shape as JobPostingModel returns: empty optional fields left out, dates as ISO strings.
function toJob(row: JobRow): JobPosting {
  const { city, description, createdAt, ...rest } = row;
  return {
    ...rest,
    ...(city !== null && { city }),
    ...(description !== null && { description }),
    createdAt: createdAt.toISOString(),
  };
}

// Ids that can't exist in an integer column match no user (instead of a database error).
function isValidId(id: number) {
  return Number.isInteger(id) && id > 0 && id <= 2_147_483_647;
}

// Prisma reports a unique-index violation as P2002. With the pg adapter the index
// name is in meta.driverAdapterError.cause.constraint.index; without it, in meta.target.
type UniqueError = {
  code?: string;
  meta?: { target?: unknown; driverAdapterError?: { cause?: { constraint?: { index?: string; fields?: string[] } } } };
};

function isUniqueEmailError(err: unknown) {
  if (typeof err !== "object" || err === null) return false;
  const { code, meta } = err as UniqueError;
  if (code !== "P2002") return false;
  const constraint = meta?.driverAdapterError?.cause?.constraint;
  const target = meta?.target;
  return (
    constraint?.index === "users_email_key" ||
    constraint?.fields?.includes("email") === true ||
    (Array.isArray(target) ? target.includes("email") : target === "users_email_key")
  );
}

// ---------- Validation ----------

const FIELDS = ["fullName", "email", "age", "school"] as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Checks the fields in `input`. `required` lists fields that must be present;
// any other field is checked only if it was sent. Returns only the known, cleaned fields.
// Whether an email is already taken is decided by the database (see write below).
function validate(input: UserInput, required: readonly (keyof UserFields)[]): Partial<UserFields> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ValidationError("Request body must be an object.");
  }

  for (const field of required) {
    if (input[field] === undefined) throw new ValidationError(`"${field}" is required.`, field);
  }

  const data: Partial<UserFields> = {};

  for (const field of ["fullName", "school"] as const) {
    const value = input[field];
    if (value === undefined) continue;
    if (typeof value !== "string" || value.trim() === "") {
      throw new ValidationError(`"${field}" must be a non-empty string.`, field);
    }
    data[field] = value.trim();
  }

  if (input.email !== undefined) {
    const email = typeof input.email === "string" ? input.email.trim() : "";
    if (!EMAIL_PATTERN.test(email)) {
      throw new ValidationError('"email" must be a valid email address.', "email");
    }
    // Stored in lowercase, so the case-sensitive unique index also treats
    // Ayse@Example.com and ayse@example.com as the same email.
    data.email = email.toLowerCase();
  }

  if (input.age !== undefined) {
    const age = input.age;
    if (typeof age !== "number" || !Number.isInteger(age) || age <= 0) {
      throw new ValidationError('"age" must be a positive whole number.', "age");
    }
    data.age = age;
  }

  // Same key order as the User type, whatever order the input used.
  const ordered: Partial<UserFields> = {};
  for (const field of FIELDS) if (data[field] !== undefined) (ordered as UserInput)[field] = data[field];
  return ordered;
}

// Runs a write and turns the database's duplicate-email error into a ConflictError.
async function write<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (err) {
    if (isUniqueEmailError(err)) throw new ConflictError('"email" is already used by another user.', "email");
    throw err;
  }
}

// ---------- CRUD ----------

export const UserModel = {
  async getAll(): Promise<User[]> {
    const rows = await prisma.user.findMany({ select: SELECT, orderBy: { id: "asc" } });
    return rows.map(toUser);
  },

  async getById(id: number): Promise<User | null> {
    if (!isValidId(id)) return null;
    const row = await prisma.user.findUnique({ where: { id }, select: SELECT });
    return row ? toUser(row) : null;
  },

  // The user and their job postings in one Prisma call (include). A user without
  // postings gets jobs: []. Returns null if no user has this id.
  async getByIdWithJobs(id: number): Promise<UserWithJobs | null> {
    if (!isValidId(id)) return null;
    const row = await prisma.user.findUnique({ where: { id }, include: { jobPostings: JOBS } });
    if (!row) return null;
    const { jobPostings, ...user } = row;
    return { ...toUser(pick(user)), jobs: jobPostings.map(toJob) };
  },

  // fullName, email and age are required; school is optional. The id is generated by the database.
  async create(data: UserInput): Promise<User> {
    const fields = validate(data, ["fullName", "email", "age"]) as UserFields;
    const row = await write(() => prisma.user.create({ data: fields, select: SELECT }));
    return toUser(row);
  },

  // Changes only the fields sent. Returns null if no user has this id.
  async update(id: number, partialData: UserInput): Promise<User | null> {
    if (!(await this.getById(id))) return null;

    const fields = validate(partialData, []);
    if (Object.keys(fields).length === 0) {
      throw new ValidationError(`Send at least one of: ${FIELDS.join(", ")}.`);
    }

    const row = await write(() => prisma.user.update({ where: { id }, data: fields, select: SELECT }));
    return toUser(row);
  },

  // Replaces the whole user, so every field is required. Returns null if no user has this id.
  async replace(id: number, fullData: UserInput): Promise<User | null> {
    if (!(await this.getById(id))) return null;

    const fields = validate(fullData, FIELDS) as UserFields;
    const row = await write(() => prisma.user.update({ where: { id }, data: fields, select: SELECT }));
    return toUser(row);
  },

  // Returns false if no user has this id.
  async remove(id: number): Promise<boolean> {
    if (!isValidId(id)) return false;
    const { count } = await prisma.user.deleteMany({ where: { id } });
    return count > 0;
  },
};
