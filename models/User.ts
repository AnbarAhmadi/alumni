// User model: the User type, the validation rules and the CRUD functions.
// The data lives in the PostgreSQL "users" table and is read and written
// through Prisma Client (lib/prisma.ts). It has no HTTP or Next.js code.
//
// The table also has isAlumni and graduationYear (see ddd.md), read only by the
// /users pages and set only by register. role and passwordHash (Week 10) are written
// by create and register. passwordHash is read only by authenticate, to compare it,
// and NO function here returns it, so no API answer, page or log can show it.
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { scrubError } from "@/lib/redact";
import type { JobPosting } from "./JobPosting";

export type User = {
  id: number;
  fullName: string;
  email: string;
  age?: number; // optional since Week 10: users who registered have none
  school?: string;
};

export type UserFields = Omit<User, "id">;

// A user with their job postings, for GET /api/users/:id.
export type UserWithJobs = User & { jobs: JobPosting[] };

// Alumni status, read-only and for the web pages only (Week 9): the API, the forms
// and the other model functions don't use these two columns (see ddd.md).
export type AlumniStatus = { isAlumni: boolean; graduationYear?: number };
export type UserWithStatus = User & AlumniStatus;
export type UserProfile = UserWithJobs & AlumniStatus;

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

type Row = { id: number; fullName: string; email: string; age: number | null; school: string | null };

// Only the columns the app uses (include returns every column, e.g. isAlumni too).
function pick(row: Row): Row {
  return { id: row.id, fullName: row.fullName, email: row.email, age: row.age, school: row.school };
}

// An empty age or school is left out of the result (never null), as before.
function toUser(row: Row): User {
  const { age, school, ...rest } = row;
  return { ...rest, ...(age !== null && { age }), ...(school !== null && { school }) };
}

// The same columns plus the alumni status, for getAllWithStatus and getProfile only.
const STATUS_SELECT = { ...SELECT, isAlumni: true, graduationYear: true } as const;

type StatusRow = Row & { isAlumni: boolean; graduationYear: number | null };

// An empty graduation year is left out of the result (never null), like school.
function toUserWithStatus(row: StatusRow): UserWithStatus {
  const { isAlumni, graduationYear, ...user } = row;
  return { ...toUser(user), isAlumni, ...(graduationYear !== null && { graduationYear }) };
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
// Any other error is rethrown without password hashes in its message (Prisma prints the
// query's arguments there, passwordHash included).
async function write<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (err) {
    if (isUniqueEmailError(err)) throw new ConflictError('"email" is already used by another user.', "email");
    scrubError(err);
    throw err;
  }
}

// ---------- Passwords and registration (Week 10) ----------

// What a user may do on the site (ddd.md, Roles). Not the same as isAlumni.
export type Role = "ADMIN" | "ALUMNI" | "STUDENT";

// A user with their role and alumni status, never the hash: the answer of register,
// login and GET /api/me.
export type UserAccount = UserWithStatus & { role: Role };

export type FieldError = { field: string; message: string };

// A registration with one or more invalid fields. message and field are the first
// error (the API answers with that one); errors has all of them (for the form).
export class RegistrationError extends ValidationError {
  errors: FieldError[];

  constructor(errors: FieldError[]) {
    super(errors[0].message, errors[0].field);
    this.name = "RegistrationError";
    this.errors = errors;
  }
}

const BCRYPT_COST = 10;
const MIN_PASSWORD_LENGTH = 8;
const FIRST_GRADUATION_YEAR = 1950;
const REGISTER_ROLES = ["ALUMNI", "STUDENT"] as const; // ADMIN can't be chosen (ddd.md)

function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

// Users created without a password (POST /api/users and the /users form) get the hash
// of a random password that is never shown, so passwordHash is always set.
function hashRandomPassword(): Promise<string> {
  return hashPassword(randomBytes(32).toString("base64url"));
}

type Registration = {
  fullName: string;
  email: string;
  password: string;
  role: (typeof REGISTER_ROLES)[number];
  graduationYear?: number;
  school?: string;
};

// The register rules of ddd.md. Collects every broken rule, in the order of the form,
// instead of stopping at the first. Whether the email is taken is decided by the database.
function validateRegistration(input: UserInput): Registration {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ValidationError("Request body must be an object.");
  }
  const errors: FieldError[] = [];
  const fail = (field: string, message: string) => errors.push({ field, message });
  const text = (field: string) => (typeof input[field] === "string" ? (input[field] as string).trim() : "");

  if (input.fullName === undefined) fail("fullName", '"fullName" is required.');
  else if (text("fullName") === "") fail("fullName", '"fullName" must be a non-empty string.');

  const email = text("email").toLowerCase();
  if (input.email === undefined) fail("email", '"email" is required.');
  else if (!EMAIL_PATTERN.test(email)) fail("email", '"email" must be a valid email address.');

  // Passwords are not trimmed. The length is counted in Unicode characters.
  const { password, confirmPassword } = input;
  if (password === undefined) fail("password", '"password" is required.');
  else if (typeof password !== "string" || [...password].length < MIN_PASSWORD_LENGTH) {
    fail("password", `"password" must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (confirmPassword === undefined) fail("confirmPassword", '"confirmPassword" is required.');
  else if (confirmPassword !== password) fail("confirmPassword", '"confirmPassword" must match "password".');

  const role = REGISTER_ROLES.find((r) => r === input.role);
  if (input.role === undefined) fail("role", '"role" is required.');
  else if (!role) fail("role", '"role" must be ALUMNI or STUDENT.');

  const year = input.graduationYear;
  const currentYear = new Date().getFullYear();
  if (role === "ALUMNI") {
    if (year === undefined) fail("graduationYear", '"graduationYear" is required for alumni.');
    else if (typeof year !== "number" || !Number.isInteger(year) || year < FIRST_GRADUATION_YEAR || year > currentYear) {
      fail("graduationYear", `"graduationYear" must be a year from ${FIRST_GRADUATION_YEAR} to ${currentYear}.`);
    }
  } else if (role === "STUDENT" && year !== undefined) {
    fail("graduationYear", '"graduationYear" is not allowed for students.');
  }

  if (input.school !== undefined && text("school") === "") fail("school", '"school" must be a non-empty string.');

  if (errors.length > 0 || !role) throw new RegistrationError(errors);
  return {
    fullName: text("fullName"),
    email,
    password: password as string,
    role,
    ...(role === "ALUMNI" && { graduationYear: year as number }),
    ...(input.school !== undefined && { school: text("school") }),
  };
}

// ---------- Safety rules (Week 10, ddd.md) ----------

// Who asks for a change: the logged-in user's id and role, or null (a script).
export type Actor = { id: number; role: Role } | null;

const ROLES = ["ADMIN", "ALUMNI", "STUDENT"] as const;

// A change that would break a safety rule. The API answers 409; the pages show the message.
export class SafetyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SafetyError";
  }
}

export const SAFETY = {
  selfDelete: "You can't delete your own admin account.",
  lastAdminDelete: "The last admin can't be deleted.",
  lastAdminDemote: "The last admin can't be demoted. Make another user an admin first.",
} as const;

// The columns of a UserAccount: never passwordHash.
const ACCOUNT_SELECT = { ...STATUS_SELECT, role: true } as const;

function toAccount(row: StatusRow & { role: Role }): UserAccount {
  const { role, ...user } = row;
  return { ...toUserWithStatus(user), role };
}

// A bcrypt hash of a random password nobody knows, made once, for the dummy compare
// of an unknown email in authenticate. Same cost as a real hash.
let dummyHashPromise: Promise<string> | undefined;
function dummyHash(): Promise<string> {
  dummyHashPromise ??= hashPassword(randomBytes(32).toString("base64url"));
  return dummyHashPromise;
}

// Login rules: email and password are required (a blank one counts as missing).
// The email is trimmed and lowercased, like on register; the password is used as typed.
function validateLogin(input: UserInput): { email: string; password: string } {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ValidationError("Request body must be an object.");
  }
  const { email, password } = input;
  if (typeof email !== "string" || email.trim() === "") throw new ValidationError('"email" is required.', "email");
  if (typeof password !== "string" || password === "") throw new ValidationError('"password" is required.', "password");
  return { email: email.trim().toLowerCase(), password };
}

// ---------- CRUD ----------

export const UserModel = {
  async getAll(): Promise<User[]> {
    const rows = await prisma.user.findMany({ select: SELECT, orderBy: { id: "asc" } });
    return rows.map(toUser);
  },

  // How many users there are (read-only; used by the homepage).
  async count(): Promise<number> {
    return prisma.user.count();
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

  // All users with their alumni status, oldest first (read-only; for the /users page).
  async getAllWithStatus(): Promise<UserWithStatus[]> {
    const rows = await prisma.user.findMany({ select: STATUS_SELECT, orderBy: { id: "asc" } });
    return rows.map(toUserWithStatus);
  },

  // One user with their alumni status and job postings (read-only; for the /users/[id] page).
  async getProfile(id: number): Promise<UserProfile | null> {
    if (!isValidId(id)) return null;
    const row = await prisma.user.findUnique({ where: { id }, select: { ...STATUS_SELECT, jobPostings: JOBS } });
    if (!row) return null;
    const { jobPostings, ...user } = row;
    return { ...toUserWithStatus(user), jobs: jobPostings.map(toJob) };
  },

  // fullName, email and age are required; school is optional. The id is generated by the database.
  // The user gets the default role (STUDENT) and the hash of a random password (see hashRandomPassword).
  async create(data: UserInput): Promise<User> {
    const fields = validate(data, ["fullName", "email", "age"]) as UserFields;
    const passwordHash = await hashRandomPassword();
    const row = await write(() => prisma.user.create({ data: { ...fields, passwordHash }, select: SELECT }));
    return toUser(row);
  },

  // Register (Week 10): the register rules of ddd.md, for POST /api/register and the /register page.
  // Only the bcrypt hash of the password is stored. ALUMNI users are graduates, so isAlumni is true.
  // Throws RegistrationError (every invalid field) or ConflictError (the email is taken).
  async register(input: UserInput): Promise<UserAccount> {
    const { password, ...fields } = validateRegistration(input);
    const passwordHash = await hashPassword(password);
    const row = await write(() =>
      prisma.user.create({
        data: { ...fields, isAlumni: fields.role === "ALUMNI", passwordHash },
        select: ACCOUNT_SELECT,
      }),
    );
    return toAccount(row);
  },

  // Login (Week 10): checks an email and password (ddd.md, Login and sessions).
  // Throws ValidationError if one is missing; returns null for an unknown email OR a wrong
  // password, so the caller gives one generic error. The only function that reads
  // passwordHash, and it never returns it.
  async authenticate(input: UserInput): Promise<UserAccount | null> {
    const { email, password } = validateLogin(input);
    const row = await prisma.user.findUnique({ where: { email }, select: { ...ACCOUNT_SELECT, passwordHash: true } });
    if (!row) {
      // Same work as a real check, so the time taken doesn't tell whether the email exists.
      await bcrypt.compare(password, await dummyHash());
      return null;
    }
    const { passwordHash, ...account } = row;
    return (await bcrypt.compare(password, passwordHash)) ? toAccount(account) : null;
  },

  // One user's account (role and alumni status), for the logged-in user. Null if no user has this id.
  async getAccount(id: number): Promise<UserAccount | null> {
    if (!isValidId(id)) return null;
    const row = await prisma.user.findUnique({ where: { id }, select: ACCOUNT_SELECT });
    return row ? toAccount(row) : null;
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

  // Deletes a user. Returns false if no user has this id. `actor` is who asks (null for
  // scripts). Follows the safety rules (ddd.md): an admin can't delete their own account,
  // and the last admin can't be deleted (SafetyError).
  async remove(id: number, actor: Actor = null): Promise<boolean> {
    if (!isValidId(id)) return false;
    return prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id }, select: { role: true } });
      if (!target) return false;
      if (target.role === "ADMIN") {
        if (actor?.id === id) throw new SafetyError(SAFETY.selfDelete);
        // Locks every admin row, so two requests at once can't both remove "the other" admin.
        const admins = await tx.$queryRaw<{ id: number }[]>`SELECT id FROM users WHERE role = 'ADMIN' FOR UPDATE`;
        if (admins.length <= 1) throw new SafetyError(SAFETY.lastAdminDelete);
      }
      await tx.user.delete({ where: { id } });
      return true;
    });
  },

  // ---------- Admin panel (Week 10) ----------

  // Every user with role and alumni status, oldest first (never passwordHash).
  async getAllAccounts(): Promise<UserAccount[]> {
    const rows = await prisma.user.findMany({ select: ACCOUNT_SELECT, orderBy: { id: "asc" } });
    return rows.map(toAccount);
  },

  // How many users have each role, for the admin dashboard.
  async countByRole(): Promise<Record<Role, number>> {
    const groups = await prisma.user.groupBy({ by: ["role"], _count: { _all: true } });
    const counts: Record<Role, number> = { ADMIN: 0, ALUMNI: 0, STUDENT: 0 };
    for (const group of groups) counts[group.role] = group._count._all;
    return counts;
  },

  // Changes a user's role (ADMIN, ALUMNI or STUDENT). Returns null if no user has this id.
  // Follows the safety rules: the last admin can't be demoted (SafetyError).
  // isAlumni is not changed: it says whether the person graduated, not what they may do.
  async changeRole(id: number, input: UserInput): Promise<UserAccount | null> {
    if (!isValidId(id)) return null;
    const role = ROLES.find((r) => r === input?.role);
    if (input?.role === undefined) throw new ValidationError('"role" is required.', "role");
    if (!role) throw new ValidationError('"role" must be ADMIN, ALUMNI or STUDENT.', "role");

    return prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id }, select: { role: true } });
      if (!target) return null;
      if (target.role === "ADMIN" && role !== "ADMIN") {
        const admins = await tx.$queryRaw<{ id: number }[]>`SELECT id FROM users WHERE role = 'ADMIN' FOR UPDATE`;
        if (admins.length <= 1) throw new SafetyError(SAFETY.lastAdminDemote);
      }
      return toAccount(await tx.user.update({ where: { id }, data: { role }, select: ACCOUNT_SELECT }));
    });
  },

  // ---------- My profile (Week 10, /me) ----------
  // Both work on the session user's id only (the caller passes it); no id comes from the request.

  // Edits the user's own full name, school and graduation year (never email or role).
  // school: an empty value clears it. graduationYear: required for a graduate (isAlumni),
  // 1950 to the current year; not allowed for anyone else. Collects every broken rule
  // (RegistrationError). Returns null if no user has this id.
  async updateOwnProfile(id: number, input: UserInput): Promise<UserAccount | null> {
    const current = await this.getAccount(id);
    if (!current) return null;
    const errors: FieldError[] = [];
    const fail = (field: string, message: string) => errors.push({ field, message });
    const text = (field: string) => (typeof input[field] === "string" ? (input[field] as string).trim() : "");

    if (input.fullName === undefined || text("fullName") === "") fail("fullName", '"fullName" is required.');

    const year = input.graduationYear;
    const currentYear = new Date().getFullYear();
    if (current.isAlumni) {
      if (year === undefined) fail("graduationYear", '"graduationYear" is required for alumni.');
      else if (typeof year !== "number" || !Number.isInteger(year) || year < FIRST_GRADUATION_YEAR || year > currentYear) {
        fail("graduationYear", `"graduationYear" must be a year from ${FIRST_GRADUATION_YEAR} to ${currentYear}.`);
      }
    } else if (year !== undefined) {
      fail("graduationYear", '"graduationYear" is not allowed for students.');
    }
    if (errors.length > 0) throw new RegistrationError(errors);

    const data = {
      fullName: text("fullName"),
      school: text("school") || null,
      ...(current.isAlumni && { graduationYear: year as number }),
    };
    const row = await write(() => prisma.user.update({ where: { id }, data, select: ACCOUNT_SELECT }));
    return toAccount(row);
  },

  // Changes the user's own password: currentPassword must be right, newPassword at least
  // 8 characters, confirmPassword the same. Only the new bcrypt hash is stored; the hash
  // is never returned. Collects every broken rule (RegistrationError). False if no such user.
  async changePassword(id: number, input: UserInput): Promise<boolean> {
    if (!isValidId(id)) return false;
    const row = await prisma.user.findUnique({ where: { id }, select: { passwordHash: true } });
    if (!row) return false;
    const errors: FieldError[] = [];
    const fail = (field: string, message: string) => errors.push({ field, message });
    const { currentPassword, newPassword, confirmPassword } = input;

    if (typeof currentPassword !== "string" || currentPassword === "") fail("currentPassword", '"currentPassword" is required.');
    else if (!(await bcrypt.compare(currentPassword, row.passwordHash))) fail("currentPassword", '"currentPassword" is wrong.');
    if (typeof newPassword !== "string" || [...newPassword].length < MIN_PASSWORD_LENGTH) {
      fail("newPassword", `"newPassword" must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    if (confirmPassword !== newPassword) fail("confirmPassword", '"confirmPassword" must match "newPassword".');
    if (errors.length > 0) throw new RegistrationError(errors);

    const passwordHash = await hashPassword(newPassword as string);
    await write(() => prisma.user.update({ where: { id }, data: { passwordHash }, select: { id: true } }));
    return true;
  },
};
