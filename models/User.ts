// User model: the User type, the in-memory store, the validation rules and the
// CRUD functions. It has no HTTP or Next.js code, so it works anywhere.
//
// The data lives in memory for now. To move to a database (e.g. Prisma) later,
// only the bodies of the UserModel functions below need to change; the
// controllers call the same functions and don't need to change.

export type User = {
  id: number;
  fullName: string;
  email: string;
  age: number;
  school?: string;
};

export type UserFields = Omit<User, "id">;

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

// ---------- In-memory store ----------

type Store = { users: User[]; nextId: number };

// Kept on globalThis so Next.js dev hot reloads (and separately bundled
// routes) all share one array instead of starting from scratch.
const globalStore = globalThis as typeof globalThis & { userModelStore?: Store };

const store: Store = (globalStore.userModelStore ??= {
  users: [
    { id: 1, fullName: "Ayşe Yılmaz", email: "ayse.yilmaz@example.com", age: 24, school: "Istanbul University" },
    { id: 2, fullName: "Mehmet Kaya", email: "mehmet.kaya@example.com", age: 27, school: "Boğaziçi University" },
    { id: 3, fullName: "Elif Demir", email: "elif.demir@example.com", age: 22 },
  ],
  nextId: 4,
});

function indexOf(id: number) {
  return store.users.findIndex((u) => u.id === id);
}

// ---------- Validation ----------

const FIELDS = ["fullName", "email", "age", "school"] as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Checks the fields in `input`. `required` lists fields that must be present;
// any other field is checked only if it was sent. `ignoreId` lets a user keep
// their own email when updating. Returns only the known, cleaned fields.
function validate(
  input: UserInput,
  required: readonly (keyof UserFields)[],
  ignoreId?: number,
): Partial<UserFields> {
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
    const taken = store.users.some(
      (u) => u.id !== ignoreId && u.email.toLowerCase() === email.toLowerCase(),
    );
    if (taken) throw new ValidationError('"email" is already used by another user.', "email");
    data.email = email;
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

// ---------- CRUD ----------

export const UserModel = {
  getAll(): User[] {
    return store.users;
  },

  getById(id: number): User | null {
    return store.users[indexOf(id)] ?? null;
  },

  // fullName, email and age are required; school is optional. The id is generated.
  create(data: UserInput): User {
    const fields = validate(data, ["fullName", "email", "age"]) as UserFields;
    const user: User = { id: store.nextId++, ...fields };
    store.users.push(user);
    return user;
  },

  // Changes only the fields sent. Returns null if no user has this id.
  update(id: number, partialData: UserInput): User | null {
    const index = indexOf(id);
    if (index === -1) return null;

    const fields = validate(partialData, [], id);
    if (Object.keys(fields).length === 0) {
      throw new ValidationError(`Send at least one of: ${FIELDS.join(", ")}.`);
    }

    store.users[index] = { ...store.users[index], ...fields };
    return store.users[index];
  },

  // Replaces the whole user, so every field is required. Returns null if no user has this id.
  replace(id: number, fullData: UserInput): User | null {
    const index = indexOf(id);
    if (index === -1) return null;

    const fields = validate(fullData, FIELDS, id) as UserFields;
    store.users[index] = { id, ...fields };
    return store.users[index];
  },

  // Returns false if no user has this id.
  remove(id: number): boolean {
    const index = indexOf(id);
    if (index === -1) return false;

    store.users.splice(index, 1);
    return true;
  },
};
