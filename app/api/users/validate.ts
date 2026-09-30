import type { User } from "./store";

export type UserFields = Omit<User, "id">;

type Result<T> = { data: T } | { error: string };

export function badRequest(error: string) {
  return Response.json({ error }, { status: 400 });
}

export async function readJsonBody(request: Request): Promise<Result<unknown>> {
  try {
    return { data: await request.json() };
  } catch {
    return { error: "Request body must be valid JSON." };
  }
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

// Checks every user field. With `partial`, missing fields are allowed,
// but any field that is sent must still be valid.
export function validateUserFields(body: unknown, partial: true): Result<Partial<UserFields>>;
export function validateUserFields(body: unknown, partial?: false): Result<UserFields>;
export function validateUserFields(
  body: unknown,
  partial = false,
): Result<Partial<UserFields>> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { error: "Request body must be a JSON object." };
  }

  const { fullName, email, school, age } = body as Record<string, unknown>;
  const data: Partial<UserFields> = {};

  for (const [key, value] of Object.entries({ fullName, email, school })) {
    if (value === undefined && partial) continue;
    if (!nonEmptyString(value)) return { error: `"${key}" is required.` };
    data[key as "fullName" | "email" | "school"] = value.trim();
  }

  if (!(age === undefined && partial)) {
    if (typeof age !== "number" || !Number.isInteger(age) || age <= 0) {
      return { error: '"age" must be a positive whole number.' };
    }
    data.age = age;
  }

  if (partial && Object.keys(data).length === 0) {
    return { error: "Send at least one of: fullName, email, school, age." };
  }

  return { data };
}
