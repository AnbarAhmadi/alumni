// API controller for applications (users and job postings, many-to-many):
//   POST /api/jobs/[id]/applications   a user applies to a posting
//   GET  /api/jobs/[id]/applications   the applicants of a posting, with their names
//   GET  /api/users/[id]/applications  the postings a user applied to, with title and company
// It turns HTTP requests into model calls and returns JSON responses with the
// right status codes. All data access goes through the models.
import { NextResponse } from "next/server";
import { ApplicationModel, ConflictError, ValidationError } from "@/models/Application";
import { JobPostingModel } from "@/models/JobPosting";
import { UserModel } from "@/models/User";
import { BodyParseError, parseBody } from "@/lib/parseBody";

function errorResponse(message: string, status: number, field?: string) {
  return NextResponse.json(field ? { error: message, field } : { error: message }, { status });
}

function postingNotFound(id: string | number) {
  return errorResponse(`Job posting "${id}" not found.`, 404);
}

function userNotFound(id: string | number) {
  return errorResponse(`User "${id}" not found.`, 404);
}

// Ids in the URL are strings; anything that isn't a whole number matches nothing.
function toId(id: string) {
  return /^\d+$/.test(id) ? Number(id) : NaN;
}

// Turns known errors into 400/409/415 responses; anything else is a real bug and is rethrown.
function handleError(err: unknown) {
  if (err instanceof ValidationError) return errorResponse(err.message, 400, err.field);
  if (err instanceof ConflictError) return errorResponse(err.message, 409, err.field);
  if (err instanceof BodyParseError) return errorResponse(err.message, err.status);
  throw err;
}

// POST /api/jobs/[id]/applications → 201 | 400 | 404 | 409 | 415
// Body: { "userId": ... }, the applicant. The posting comes from the URL; a
// jobPostingId in the body is ignored. A second application by the same user
// is refused by the database's unique pair (userId, jobPostingId) → 409.
export async function createForJob(request: Request, id: string) {
  if (!(await JobPostingModel.getById(toId(id)))) return postingNotFound(id);

  try {
    const body = await parseBody(request);
    const userId = body.userId;
    if (userId === undefined) throw new ValidationError('"userId" is required.', "userId");
    if (typeof userId !== "number" || !Number.isInteger(userId) || userId <= 0) {
      throw new ValidationError('"userId" must be a positive whole number.', "userId");
    }
    if (!(await UserModel.getById(userId))) return userNotFound(userId);

    // Only userId (and an optional status) come from the body; jobPostingId is set last, from the URL.
    const application = await ApplicationModel.create({ userId, status: body.status, jobPostingId: toId(id) });
    return NextResponse.json(application, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

// GET /api/jobs/[id]/applications → 200 | 404
export async function getForJob(_request: Request, id: string) {
  if (!(await JobPostingModel.getById(toId(id)))) return postingNotFound(id);

  return NextResponse.json(await ApplicationModel.getAllByJobPosting(toId(id)));
}

// GET /api/users/[id]/applications → 200 | 404
export async function getForUser(_request: Request, id: string) {
  if (!(await UserModel.getById(toId(id)))) return userNotFound(id);

  return NextResponse.json(await ApplicationModel.getAllByUser(toId(id)));
}
