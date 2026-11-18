// API controller: turns HTTP requests into AnnouncementModel calls and returns
// JSON responses with the right status codes. All data access goes through
// AnnouncementModel.
import { NextResponse } from "next/server";
import { AnnouncementModel, ValidationError } from "@/models/Announcement";
import { BodyParseError, parseBody } from "@/lib/parseBody";
import { recordNotFound } from "@/lib/notFound";

function errorResponse(message: string, status: number, field?: string) {
  return NextResponse.json(field ? { error: message, field } : { error: message }, { status });
}

// Ids in the URL are strings; anything that isn't a whole number matches no announcement.
function toId(id: string) {
  return /^\d+$/.test(id) ? Number(id) : NaN;
}

// Turns known errors into 400/415 responses; anything else is a real bug and is rethrown.
function handleError(err: unknown) {
  if (err instanceof ValidationError) return errorResponse(err.message, 400, err.field);
  if (err instanceof BodyParseError) return errorResponse(err.message, err.status);
  throw err;
}

// GET /api/announcements → 200
export async function getAll() {
  return NextResponse.json(await AnnouncementModel.getAll());
}

// GET /api/announcements/[id] → 200 | 404
export async function getById(_request: Request, id: string) {
  const announcement = await AnnouncementModel.getById(toId(id));
  if (!announcement) return recordNotFound("Announcement", id);

  return NextResponse.json(announcement);
}

// POST /api/announcements → 201 | 400 | 415
export async function create(request: Request) {
  try {
    const announcement = await AnnouncementModel.create(await parseBody(request));
    return NextResponse.json(announcement, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

// PATCH /api/announcements/[id]: only the fields sent are changed → 200 | 400 | 404 | 415
export async function update(request: Request, id: string) {
  if (!(await AnnouncementModel.getById(toId(id)))) return recordNotFound("Announcement", id);

  try {
    const announcement = await AnnouncementModel.update(toId(id), await parseBody(request));
    return announcement ? NextResponse.json(announcement) : recordNotFound("Announcement", id);
  } catch (err) {
    return handleError(err);
  }
}

// PUT /api/announcements/[id]: title and content are required → 200 | 400 | 404 | 415
export async function replace(request: Request, id: string) {
  if (!(await AnnouncementModel.getById(toId(id)))) return recordNotFound("Announcement", id);

  try {
    const announcement = await AnnouncementModel.replace(toId(id), await parseBody(request));
    return announcement ? NextResponse.json(announcement) : recordNotFound("Announcement", id);
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/announcements/[id] → 204 (no body) | 404
export async function remove(_request: Request, id: string) {
  if (!(await AnnouncementModel.remove(toId(id)))) return recordNotFound("Announcement", id);

  return new NextResponse(null, { status: 204 });
}
