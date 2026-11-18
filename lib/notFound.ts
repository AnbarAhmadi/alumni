// The one 404 answer of the JSON API. Every 404 has the same shape:
//   { "error": "Not found", "reason": "User 9999 does not exist" }
// Used by the API controllers (unknown ids) and by the catch-all route
// app/api/[[...slug]]/route.ts (unknown paths).
import { NextResponse } from "next/server";

export function notFoundResponse(reason: string) {
  return NextResponse.json({ error: "Not found", reason }, { status: 404 });
}

// A record that is not in the database, for example recordNotFound("User", "9999").
export function recordNotFound(entity: string, id: string | number) {
  return notFoundResponse(`${entity} ${id} does not exist`);
}
