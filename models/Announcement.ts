// Announcement model: the Announcement type, the in-memory store, the
// validation rules and the CRUD functions. It has no HTTP or Next.js code,
// so it works anywhere.
//
// The data lives in memory for now, like the User model. To move to a
// database later, only the bodies of the AnnouncementModel functions below
// need to change.
import { ValidationError } from "./User";

export { ValidationError };

export type Announcement = {
  id: number;
  title: string;
  content: string;
  author?: string;
  createdAt: string; // ISO date, set when the announcement is created
};

// The fields a client may send. id and createdAt are always set by the server.
export type AnnouncementFields = Pick<Announcement, "title" | "content" | "author">;

// Raw input from a request body or form. Unknown keys (including "id" and "createdAt") are ignored.
export type AnnouncementInput = Record<string, unknown>;

// ---------- In-memory store ----------

type Store = { announcements: Announcement[]; nextId: number };

// Kept on globalThis so Next.js dev hot reloads (and separately bundled
// routes) all share one array instead of starting from scratch.
const globalStore = globalThis as typeof globalThis & { announcementModelStore?: Store };

const store: Store = (globalStore.announcementModelStore ??= {
  announcements: [
    {
      id: 1,
      title: "Welcome to the Alumni Tracking System",
      content: "The MIS department now has one place to stay in touch with its graduates. Please keep your details up to date.",
      author: "MIS Department",
      createdAt: "2026-09-22T09:00:00.000Z",
    },
    {
      id: 2,
      title: "Alumni meetup in October",
      content: "Graduates and current students are invited to an evening of talks and networking on campus.",
      author: "Alumni Office",
      createdAt: "2026-09-30T12:30:00.000Z",
    },
    {
      id: 3,
      title: "Mentors wanted",
      content: "We are looking for graduates who would like to mentor a current MIS student this semester.",
      createdAt: "2026-10-07T08:15:00.000Z",
    },
  ],
  nextId: 4,
});

function indexOf(id: number) {
  return store.announcements.findIndex((a) => a.id === id);
}

// ---------- Validation ----------

const FIELDS = ["title", "content", "author"] as const;

// Checks the fields in `input`. `required` lists fields that must be present;
// any other field is checked only if it was sent. Returns only the known, cleaned fields.
function validate(
  input: AnnouncementInput,
  required: readonly (keyof AnnouncementFields)[],
): Partial<AnnouncementFields> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ValidationError("Request body must be an object.");
  }

  for (const field of required) {
    if (input[field] === undefined) throw new ValidationError(`"${field}" is required.`, field);
  }

  const data: Partial<AnnouncementFields> = {};

  for (const field of FIELDS) {
    const value = input[field];
    if (value === undefined) continue;
    if (typeof value !== "string" || value.trim() === "") {
      throw new ValidationError(`"${field}" must be a non-empty string.`, field);
    }
    data[field] = value.trim();
  }

  return data;
}

// ---------- CRUD ----------

export const AnnouncementModel = {
  getAll(): Announcement[] {
    return store.announcements;
  },

  getById(id: number): Announcement | null {
    return store.announcements[indexOf(id)] ?? null;
  },

  // title and content are required; author is optional. id and createdAt are generated.
  create(data: AnnouncementInput): Announcement {
    const fields = validate(data, ["title", "content"]) as AnnouncementFields;
    const announcement: Announcement = {
      id: store.nextId++,
      ...fields,
      createdAt: new Date().toISOString(),
    };
    store.announcements.push(announcement);
    return announcement;
  },

  // Changes only the fields sent. Returns null if no announcement has this id.
  update(id: number, partialData: AnnouncementInput): Announcement | null {
    const index = indexOf(id);
    if (index === -1) return null;

    const fields = validate(partialData, []);
    if (Object.keys(fields).length === 0) {
      throw new ValidationError(`Send at least one of: ${FIELDS.join(", ")}.`);
    }

    store.announcements[index] = { ...store.announcements[index], ...fields };
    return store.announcements[index];
  },

  // Replaces the whole announcement: title and content are required, and author
  // is removed if it isn't sent. id and createdAt are kept. Returns null if no
  // announcement has this id.
  replace(id: number, fullData: AnnouncementInput): Announcement | null {
    const index = indexOf(id);
    if (index === -1) return null;

    const fields = validate(fullData, ["title", "content"]) as AnnouncementFields;
    const { createdAt } = store.announcements[index];
    store.announcements[index] = { id, ...fields, createdAt };
    return store.announcements[index];
  },

  // Returns false if no announcement has this id.
  remove(id: number): boolean {
    const index = indexOf(id);
    if (index === -1) return false;

    store.announcements.splice(index, 1);
    return true;
  },
};
