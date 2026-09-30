import { users, nextUserId, type User } from "./store";
import { badRequest, readJsonBody, validateUserFields } from "./validate";

export function GET() {
  return Response.json(users);
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if ("error" in body) return badRequest(body.error);

  const fields = validateUserFields(body.data);
  if ("error" in fields) return badRequest(fields.error);

  const user: User = { id: nextUserId(), ...fields.data };
  users.push(user);

  return Response.json(user, { status: 201 });
}
