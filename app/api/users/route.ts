import { users, nextUserId, type User } from "./store";

function badRequest(error: string) {
  return Response.json({ error }, { status: 400 });
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

export function GET() {
  return Response.json(users);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const { fullName, email, school, age } = (body ?? {}) as Record<string, unknown>;

  if (!nonEmptyString(fullName)) return badRequest('"fullName" is required.');
  if (!nonEmptyString(email)) return badRequest('"email" is required.');
  if (!nonEmptyString(school)) return badRequest('"school" is required.');
  if (typeof age !== "number" || !Number.isInteger(age) || age <= 0) {
    return badRequest('"age" must be a positive whole number.');
  }

  const user: User = {
    id: nextUserId(),
    fullName: fullName.trim(),
    email: email.trim(),
    school: school.trim(),
    age,
  };
  users.push(user);

  return Response.json(user, { status: 201 });
}
