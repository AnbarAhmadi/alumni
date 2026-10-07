import { users, nextUserId, type User } from "./store";
import { badRequest, readJsonBody, validateUserFields } from "./validate";

const REQUIRED_FIELDS = ["fullName", "email", "age"] as const;
const FORM_TYPES = ["multipart/form-data", "application/x-www-form-urlencoded"];

type Result<T> = { data: T } | { error: string; status: number };

// Reads the body as JSON or form data, depending on the Content-Type header.
async function readBody(request: Request): Promise<Result<Record<string, unknown>>> {
  const mediaType = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();

  if (mediaType === "application/json") {
    const body = await readJsonBody(request);
    if ("error" in body) return { error: body.error, status: 400 };
    if (typeof body.data !== "object" || body.data === null || Array.isArray(body.data)) {
      return { error: "Request body must be a JSON object.", status: 400 };
    }
    return { data: body.data as Record<string, unknown> };
  }

  if (FORM_TYPES.includes(mediaType)) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return { error: "Request body could not be read as form data.", status: 400 };
    }

    // Form values are always strings: skip empty ones and turn age into a number.
    const data: Record<string, unknown> = {};
    for (const [key, value] of form) {
      if (typeof value !== "string" || value.trim() === "") continue;
      data[key] = key === "age" && /^-?\d+(\.\d+)?$/.test(value.trim()) ? Number(value) : value;
    }
    return { data };
  }

  return {
    error: `Unsupported Content-Type "${mediaType || "none"}". Use application/json, multipart/form-data or application/x-www-form-urlencoded.`,
    status: 415,
  };
}

export function GET() {
  return Response.json(users);
}

export async function POST(request: Request) {
  const body = await readBody(request);
  if ("error" in body) return Response.json({ error: body.error }, { status: body.status });

  const missing = REQUIRED_FIELDS.find((field) => body.data[field] === undefined);
  if (missing) return badRequest(`"${missing}" is required.`);

  // Required fields are present, so only the fields that were sent need checking.
  const fields = validateUserFields(body.data, true);
  if ("error" in fields) return badRequest(fields.error);

  const user = { id: nextUserId(), ...fields.data } as User;
  users.push(user);

  return Response.json(user, { status: 201 });
}
