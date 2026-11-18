// Catch-all for unknown API paths: /api, /api/banana, /api/users/1/banana, ...
// Next.js always prefers a more specific route, so this file only answers
// paths that no other route under app/api matches. Every method gets the same
// JSON 404, for example { "error": "Not found", "reason": "No route GET /api/banana" }.
import { notFoundResponse } from "@/lib/notFound";
import { withLogger } from "@/lib/withLogger";

const noRoute = withLogger((request: Request) =>
  notFoundResponse(`No route ${request.method} ${new URL(request.url).pathname}`),
);

export const GET = noRoute;
export const HEAD = noRoute;
export const POST = noRoute;
export const PUT = noRoute;
export const PATCH = noRoute;
export const DELETE = noRoute;
export const OPTIONS = noRoute;
