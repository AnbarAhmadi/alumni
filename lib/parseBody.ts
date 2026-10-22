// Shared request-body parser for the user controllers.
// Accepts JSON, multipart/form-data and application/x-www-form-urlencoded and
// returns one plain object. Any "id" is dropped: the id always comes from the URL.

export class BodyParseError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "BodyParseError";
    this.status = status;
  }
}

const FORM_TYPES = ["multipart/form-data", "application/x-www-form-urlencoded"];
const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;
// Form values are text; these fields are turned into numbers (ids for the job and application endpoints).
const NUMERIC_FIELDS = ["age", "userId", "jobPostingId"];

// Turns form values (always strings) into a plain object: skips empty values
// and files, and converts numeric fields such as age to numbers.
export function formDataToObject(form: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const [key, value] of form) {
    if (key === "id" || typeof value !== "string" || value.trim() === "") continue;
    const text = value.trim();
    data[key] = NUMERIC_FIELDS.includes(key) && NUMBER_PATTERN.test(text) ? Number(text) : value;
  }

  return data;
}

// Throws BodyParseError (400 or 415) when the body can't be read.
export async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const mediaType = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();

  if (mediaType === "application/json") {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new BodyParseError("Request body must be valid JSON.");
    }
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new BodyParseError("Request body must be a JSON object.");
    }
    const { id: _ignored, ...data } = body as Record<string, unknown>;
    return data;
  }

  if (FORM_TYPES.includes(mediaType)) {
    try {
      return formDataToObject(await request.formData());
    } catch {
      throw new BodyParseError("Request body could not be read as form data.");
    }
  }

  throw new BodyParseError(
    `Unsupported Content-Type "${mediaType || "none"}". Use application/json, multipart/form-data or application/x-www-form-urlencoded.`,
    415,
  );
}
