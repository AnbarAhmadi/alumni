import type { NextRequest } from "next/server";
import { users } from "../store";
import { badRequest, readJsonBody, validateUserFields } from "../validate";

type Ctx = RouteContext<"/api/users/[id]">;

function notFound(id: string) {
  return Response.json({ error: `User "${id}" not found.` }, { status: 404 });
}

function findIndex(id: string) {
  return users.findIndex((u) => String(u.id) === id);
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const index = findIndex(id);
  if (index === -1) return notFound(id);

  return Response.json(users[index]);
}

// Replaces the whole user: every field must be sent.
export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const index = findIndex(id);
  if (index === -1) return notFound(id);

  const body = await readJsonBody(request);
  if ("error" in body) return badRequest(body.error);

  const fields = validateUserFields(body.data);
  if ("error" in fields) return badRequest(fields.error);

  users[index] = { id: users[index].id, ...fields.data };
  return Response.json(users[index]);
}

// Updates only the fields that are sent.
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const index = findIndex(id);
  if (index === -1) return notFound(id);

  const body = await readJsonBody(request);
  if ("error" in body) return badRequest(body.error);

  const fields = validateUserFields(body.data, true);
  if ("error" in fields) return badRequest(fields.error);

  users[index] = { ...users[index], ...fields.data };
  return Response.json(users[index]);
}

// Removes the user and returns the user that was deleted.
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const index = findIndex(id);
  if (index === -1) return notFound(id);

  const [deleted] = users.splice(index, 1);
  return Response.json(deleted);
}
