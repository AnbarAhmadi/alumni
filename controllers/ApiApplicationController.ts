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
import { recordNotFound } from "@/lib/notFound";

function errorResponse(message: string, status: number, field?: string) {
  return NextResponse.json(field ? { error: message, field } : { error: message }, { status });
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

// POST /api/jobs/[id]/applications → 201 | 404 | 409
// Nothing comes from the body (Week 10, ddd.md Access rules), so it isn't read at all:
// the applicant is ALWAYS the logged-in user, the posting comes from the URL, and the
// status is always "applied" (the database default). Only the posting's owner or an admin
// changes a status, with PATCH /api/applications/[id]. A second application by the same
// user is refused by the database's unique pair (userId, jobPostingId) → 409.
export async function createForJob(id: string, userId: number) {
  if (!(await JobPostingModel.getById(toId(id)))) return recordNotFound("Job posting", id);

  try {
    const application = await ApplicationModel.create({ userId, jobPostingId: toId(id) });
    return NextResponse.json(application, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

// PATCH /api/applications/[id] → 200 | 400 | 404 | 415 (Week 10)
// Changes an application's status, and nothing else: userId and jobPostingId in the
// body are ignored. Access (posting owner or admin) is checked by the route's guard.
export async function updateStatus(request: Request, id: string) {
  if (!(await ApplicationModel.getById(toId(id)))) return recordNotFound("Application", id);

  try {
    const { status } = await parseBody(request);
    if (status === undefined) throw new ValidationError('"status" is required.', "status");
    const application = await ApplicationModel.update(toId(id), { status });
    return application ? NextResponse.json(application) : recordNotFound("Application", id);
  } catch (err) {
    return handleError(err);
  }
}

// GET /api/jobs/[id]/applications → 200 | 404
export async function getForJob(_request: Request, id: string) {
  if (!(await JobPostingModel.getById(toId(id)))) return recordNotFound("Job posting", id);

  return NextResponse.json(await ApplicationModel.getAllByJobPosting(toId(id)));
}

// GET /api/users/[id]/applications → 200 | 404
export async function getForUser(_request: Request, id: string) {
  if (!(await UserModel.getById(toId(id)))) return recordNotFound("User", id);

  return NextResponse.json(await ApplicationModel.getAllByUser(toId(id)));
}

// DELETE /api/applications/[id] → 204 | 404 (Week 10, the admin panel; admin only).
export async function remove(id: string) {
  if (!(await ApplicationModel.remove(toId(id)))) return recordNotFound("Application", id);
  return new NextResponse(null, { status: 204 });
}
