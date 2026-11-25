// API controller: turns HTTP requests into UserModel calls and returns JSON
// responses with the right status codes. All data access goes through UserModel.
import { NextResponse } from "next/server";
import { ConflictError, SafetyError, UserModel, ValidationError, type Actor } from "@/models/User";
import { BodyParseError, parseBody } from "@/lib/parseBody";
import { recordNotFound } from "@/lib/notFound";

function errorResponse(message: string, status: number, field?: string) {
  return NextResponse.json(field ? { error: message, field } : { error: message }, { status });
}

// Ids in the URL are strings; anything that isn't a whole number matches no user.
function toId(id: string) {
  return /^\d+$/.test(id) ? Number(id) : NaN;
}

// Turns known errors into 400/409/415 responses; anything else is a real bug and is rethrown.
function handleError(err: unknown) {
  if (err instanceof ValidationError) return errorResponse(err.message, 400, err.field);
  if (err instanceof ConflictError) return errorResponse(err.message, 409, err.field);
  if (err instanceof SafetyError) return errorResponse(err.message, 409);
  if (err instanceof BodyParseError) return errorResponse(err.message, err.status);
  throw err;
}

// GET /api/users → 200
export async function getAll(_request: Request) {
  return NextResponse.json(await UserModel.getAll());
}

// GET /api/users/[id] → 200 (the user with a "jobs" array) | 404
export async function getById(_request: Request, id: string) {
  const user = await UserModel.getByIdWithJobs(toId(id));
  if (!user) return recordNotFound("User", id);

  return NextResponse.json(user);
}

// POST /api/users → 201 | 400 | 409 | 415
export async function create(request: Request) {
  try {
    const user = await UserModel.create(await parseBody(request));
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/register (Week 10): the register rules of ddd.md → 201 (the user with role, never the hash)
// | 400 (the first invalid field) | 409 (the email is taken) | 415
export async function register(request: Request) {
  try {
    const user = await UserModel.register(await parseBody(request));
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

// PATCH /api/users/[id]: only the fields sent are changed → 200 | 400 | 404 | 409 | 415
export async function update(request: Request, id: string) {
  if (!(await UserModel.getById(toId(id)))) return recordNotFound("User", id);

  try {
    const user = await UserModel.update(toId(id), await parseBody(request));
    return user ? NextResponse.json(user) : recordNotFound("User", id);
  } catch (err) {
    return handleError(err);
  }
}

// PUT /api/users/[id]: every field is required → 200 | 400 | 404 | 409 | 415
export async function replace(request: Request, id: string) {
  if (!(await UserModel.getById(toId(id)))) return recordNotFound("User", id);

  try {
    const user = await UserModel.replace(toId(id), await parseBody(request));
    return user ? NextResponse.json(user) : recordNotFound("User", id);
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/users/[id] → 204 (no body) | 404
// `actor` is the logged-in user (from the guard): the safety rules (ddd.md) refuse an admin
// deleting their own account, or the last admin, with 409.
export async function remove(_request: Request, id: string, actor: Actor = null) {
  try {
    if (!(await UserModel.remove(toId(id), actor))) return recordNotFound("User", id);
  } catch (err) {
    return handleError(err);
  }

  return new NextResponse(null, { status: 204 });
}

// PATCH /api/users/[id]/role (Week 10, admin only): { "role": "ADMIN" | "ALUMNI" | "STUDENT" }
// → 200 (the user with the new role) | 400 | 404 | 409 (the last admin can't be demoted) | 415
export async function changeRole(request: Request, id: string) {
  try {
    const user = await UserModel.changeRole(toId(id), await parseBody(request));
    return user ? NextResponse.json(user) : recordNotFound("User", id);
  } catch (err) {
    return handleError(err);
  }
}
