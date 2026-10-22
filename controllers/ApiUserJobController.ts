// API controller for a user's job postings (nested routes /api/users/[id]/jobs):
// turns HTTP requests into JobPostingModel calls and returns JSON responses with
// the right status codes. All data access goes through the models.
import { NextResponse } from "next/server";
import { JobPostingModel, ValidationError } from "@/models/JobPosting";
import { UserModel } from "@/models/User";
import { BodyParseError, parseBody } from "@/lib/parseBody";

function errorResponse(message: string, status: number, field?: string) {
  return NextResponse.json(field ? { error: message, field } : { error: message }, { status });
}

function userNotFound(id: string) {
  return errorResponse(`User "${id}" not found.`, 404);
}

// Ids in the URL are strings; anything that isn't a whole number matches no user.
function toId(id: string) {
  return /^\d+$/.test(id) ? Number(id) : NaN;
}

// Turns known errors into 400/415 responses; anything else is a real bug and is rethrown.
function handleError(err: unknown) {
  if (err instanceof ValidationError) return errorResponse(err.message, 400, err.field);
  if (err instanceof BodyParseError) return errorResponse(err.message, err.status);
  throw err;
}

// GET /api/users/[id]/jobs → 200 | 404
export async function getAll(_request: Request, id: string) {
  if (!(await UserModel.getById(toId(id)))) return userNotFound(id);

  return NextResponse.json(await JobPostingModel.getAllByUser(toId(id)));
}

// POST /api/users/[id]/jobs → 201 | 400 | 404 | 415
// The user always comes from the URL: any userId in the body is ignored.
export async function create(request: Request, id: string) {
  if (!(await UserModel.getById(toId(id)))) return userNotFound(id);

  try {
    // userId is set last, so it replaces any userId that was sent in the body.
    const posting = await JobPostingModel.create({ ...(await parseBody(request)), userId: toId(id) });
    return NextResponse.json(posting, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
