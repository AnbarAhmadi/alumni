// API controller: turns HTTP requests into UserModel calls and returns JSON
// responses with the right status codes. All data access goes through UserModel.
import { NextResponse } from "next/server";
import { UserModel, ValidationError } from "@/models/User";
import { BodyParseError, parseBody } from "@/lib/parseBody";

function errorResponse(message: string, status: number, field?: string) {
  return NextResponse.json(field ? { error: message, field } : { error: message }, { status });
}

function notFound(id: string) {
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

// GET /api/users → 200
export async function getAll(_request: Request) {
  return NextResponse.json(UserModel.getAll());
}

// GET /api/users/[id] → 200 | 404
export async function getById(_request: Request, id: string) {
  const user = UserModel.getById(toId(id));
  if (!user) return notFound(id);

  return NextResponse.json(user);
}

// POST /api/users → 201 | 400 | 415
export async function create(request: Request) {
  try {
    const user = UserModel.create(await parseBody(request));
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

// PATCH /api/users/[id]: only the fields sent are changed → 200 | 400 | 404 | 415
export async function update(request: Request, id: string) {
  if (!UserModel.getById(toId(id))) return notFound(id);

  try {
    const user = UserModel.update(toId(id), await parseBody(request));
    return user ? NextResponse.json(user) : notFound(id);
  } catch (err) {
    return handleError(err);
  }
}

// PUT /api/users/[id]: every field is required → 200 | 400 | 404 | 415
export async function replace(request: Request, id: string) {
  if (!UserModel.getById(toId(id))) return notFound(id);

  try {
    const user = UserModel.replace(toId(id), await parseBody(request));
    return user ? NextResponse.json(user) : notFound(id);
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/users/[id] → 204 (no body) | 404
export async function remove(_request: Request, id: string) {
  if (!UserModel.remove(toId(id))) return notFound(id);

  return new NextResponse(null, { status: 204 });
}
