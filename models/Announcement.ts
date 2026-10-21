// Announcement model: the Announcement type, the validation rules and the CRUD
// functions. The data lives in the PostgreSQL "announcements" table and is read
// and written through Prisma Client (lib/prisma.ts). It has no HTTP or Next.js code.
//
// The app keeps its own field names; the database columns are named as in ddd.md:
//   content   <-> message
//   createdAt <-> postedAt (an ISO string in the app, timestamptz in the database)
//   author    -> the table has no author column, so it is never stored and
//                never returned. It is still validated when sent, as before.
import { prisma } from "@/lib/prisma";
import { ValidationError } from "./User";

export { ValidationError };

export type Announcement = {
  id: number;
  title: string;
  content: string;
  author?: string;
  createdAt: string; // ISO date, set by the database when the announcement is created
};

// The fields a client may send. id and createdAt are always set by the server.
export type AnnouncementFields = Pick<Announcement, "title" | "content" | "author">;

// Raw input from a request body or form. Unknown keys (including "id" and "createdAt") are ignored.
export type AnnouncementInput = Record<string, unknown>;

// ---------- Database rows ----------

const SELECT = { id: true, title: true, message: true, postedAt: true } as const;

type Row = { id: number; title: string; message: string; postedAt: Date };

function toAnnouncement(row: Row): Announcement {
  return { id: row.id, title: row.title, content: row.message, createdAt: row.postedAt.toISOString() };
}

// The fields the app uses, renamed to the database columns. author is dropped.
function toColumns(fields: Partial<AnnouncementFields>) {
  return {
    ...(fields.title !== undefined && { title: fields.title }),
    ...(fields.content !== undefined && { message: fields.content }),
  };
}

// Ids that can't exist in an integer column match no announcement (instead of a database error).
function isValidId(id: number) {
  return Number.isInteger(id) && id > 0 && id <= 2_147_483_647;
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
  async getAll(): Promise<Announcement[]> {
    const rows = await prisma.announcement.findMany({ select: SELECT, orderBy: { id: "asc" } });
    return rows.map(toAnnouncement);
  },

  async getById(id: number): Promise<Announcement | null> {
    if (!isValidId(id)) return null;
    const row = await prisma.announcement.findUnique({ where: { id }, select: SELECT });
    return row ? toAnnouncement(row) : null;
  },

  // title and content are required; author is accepted but not stored. id and createdAt are set by the database.
  async create(data: AnnouncementInput): Promise<Announcement> {
    const fields = validate(data, ["title", "content"]) as AnnouncementFields;
    const row = await prisma.announcement.create({
      data: { title: fields.title, message: fields.content },
      select: SELECT,
    });
    return toAnnouncement(row);
  },

  // Changes only the fields sent. Returns null if no announcement has this id.
  async update(id: number, partialData: AnnouncementInput): Promise<Announcement | null> {
    if (!isValidId(id)) return null;
    const current = await prisma.announcement.findUnique({ where: { id }, select: SELECT });
    if (!current) return null;

    const fields = validate(partialData, []);
    if (Object.keys(fields).length === 0) {
      throw new ValidationError(`Send at least one of: ${FIELDS.join(", ")}.`);
    }

    // Only author was sent: there is nothing to store, so the announcement stays as it is.
    const columns = toColumns(fields);
    if (Object.keys(columns).length === 0) return toAnnouncement(current);

    const row = await prisma.announcement.update({ where: { id }, data: columns, select: SELECT });
    return toAnnouncement(row);
  },

  // Replaces the announcement: title and content are required. id and createdAt are kept.
  // Returns null if no announcement has this id.
  async replace(id: number, fullData: AnnouncementInput): Promise<Announcement | null> {
    if (!(await this.getById(id))) return null;

    const fields = validate(fullData, ["title", "content"]) as AnnouncementFields;
    const row = await prisma.announcement.update({
      where: { id },
      data: { title: fields.title, message: fields.content },
      select: SELECT,
    });
    return toAnnouncement(row);
  },

  // Returns false if no announcement has this id.
  async remove(id: number): Promise<boolean> {
    if (!isValidId(id)) return false;
    const { count } = await prisma.announcement.deleteMany({ where: { id } });
    return count > 0;
  },
};
