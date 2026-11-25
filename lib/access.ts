// Access rules (Week 10): THE one place that says who may use each page, form and API
// endpoint. It follows the "Access rules" tables in ddd.md. Everything else only looks a
// rule up here: the API guard (withAuth), the page and form guards (lib/guard.ts),
// proxy.ts, the Swagger spec, and the views that hide buttons.
//
// This file has no server-only imports (no database, no cookies), so client components
// and proxy.ts can import it too.

export type Rule = "public" | "loggedIn" | "ownerOrAdmin" | "admin";
export type Role = "ADMIN" | "ALUMNI" | "STUDENT";

// Who is asking: the logged-in user's id and role, or null when logged out.
export type Viewer = { id: number; role: Role } | null;

// Keys: "page <route>" for pages (GET), "form <name>" for server actions (forms and
// buttons), "<METHOD> <route>" for API route handlers. <route> uses the folder names
// of app/ ([id] for a dynamic part), so a key can be found from the file that uses it.
export const ACCESS_RULES = {
  // Pages
  "page /": "public",
  "page /about": "public",
  "page /login": "public",
  "page /register": "public",
  "page /users": "loggedIn",
  "page /users/[id]": "loggedIn",
  "page /users/[id]/edit": "ownerOrAdmin", // owner: the user [id]
  "page /jobs": "loggedIn", // Jobs (Week 10): every posting, with Apply
  "page /me": "loggedIn", // My profile (Week 10): always the session user's own data
  "page /me/applications": "loggedIn", // My applications: always the session user's own
  "page /announcements": "public",
  "page /announcements/[id]": "public",
  "page /announcements/[id]/edit": "admin",
  "page /admin": "admin", // the admin panel (Week 10)
  "page /admin/users": "admin",
  "page /admin/announcements": "admin",
  "page /admin/jobs": "admin",
  "page /admin/jobs/[id]/edit": "admin",
  "page /admin/applications": "admin",

  // Forms and buttons (server actions)
  "form login": "public",
  "form logout": "public",
  "form register": "public",
  "form applyToJob": "loggedIn", // /jobs: always as the session user, status "applied"
  "form updateMyProfile": "loggedIn", // /me: the session user only, never an id from the request
  "form changeMyPassword": "loggedIn",
  "form withdrawApplication": "loggedIn", // /me/applications: deletes only the session user's own
  "form createUser": "admin",
  "form updateUser": "ownerOrAdmin", // owner: the user being edited
  "form deleteUser": "ownerOrAdmin", // owner: the user being deleted
  "form createAnnouncement": "admin",
  "form updateAnnouncement": "admin",
  "form deleteAnnouncement": "admin",
  "form changeRole": "admin", // /admin/users (the safety rules are checked in the model)
  "form adminDeleteUser": "admin",
  "form adminCreateAnnouncement": "admin", // /admin/announcements (editing uses /announcements/[id]/edit)
  "form adminDeleteAnnouncement": "admin",
  "form adminCreateJob": "admin", // /admin/jobs
  "form adminUpdateJob": "admin",
  "form adminDeleteJob": "admin",
  "form adminChangeApplicationStatus": "admin", // /admin/applications
  "form adminDeleteApplication": "admin",

  // API
  "POST /api/login": "public",
  "POST /api/register": "public",
  "POST /api/logout": "public", // without a session it changes nothing (204)
  "GET /api/me": "loggedIn",
  "GET /api/users": "loggedIn",
  "POST /api/users": "admin",
  "GET /api/users/[id]": "loggedIn",
  "PUT /api/users/[id]": "ownerOrAdmin", // owner: the user [id]
  "PATCH /api/users/[id]": "ownerOrAdmin",
  "DELETE /api/users/[id]": "ownerOrAdmin", // plus the safety rules (models/User.ts)
  "PATCH /api/users/[id]/role": "admin", // plus the safety rules
  "GET /api/users/[id]/jobs": "loggedIn",
  "POST /api/users/[id]/jobs": "admin",
  "GET /api/users/[id]/applications": "ownerOrAdmin", // owner: the user [id]
  "POST /api/jobs/[id]/applications": "loggedIn", // the applicant is always the session user
  "GET /api/jobs/[id]/applications": "ownerOrAdmin", // owner: the user who owns the posting
  "PATCH /api/applications/[id]": "ownerOrAdmin", // change the status; owner: the user who owns the posting
  "DELETE /api/applications/[id]": "admin", // the admin panel (Week 10)
  "PATCH /api/jobs/[id]": "admin", // the admin panel (Week 10): edit a posting
  "DELETE /api/jobs/[id]": "admin",
  "GET /api/announcements": "public",
  "POST /api/announcements": "admin",
  "GET /api/announcements/[id]": "public",
  "PUT /api/announcements/[id]": "admin",
  "PATCH /api/announcements/[id]": "admin",
  "DELETE /api/announcements/[id]": "admin",
  "GET /api/swagger": "public",
  "GET /api/swagger/openapi.json": "public",
  "GET /api/health": "public", // deliberate exceptions: no data
  "GET /hello": "public",
  "GET /hello/[name]": "public",
  "GET /sum/[number1]/[number2]": "public",
  "ANY /api/[[...slug]]": "public", // unknown /api paths: the JSON 404
} as const satisfies Record<string, Rule>;
// Public routes need no guard call; every other key is used by exactly one guard call.

export type AccessKey = keyof typeof ACCESS_RULES;

export type Decision =
  | { ok: true; status: 200 }
  | { ok: false; status: 401; error: string }
  | { ok: false; status: 403; error: string; reason: string };

export const NOT_LOGGED_IN = "Not logged in.";

const REASONS = {
  admin: "Only an admin can do this.",
  ownerOrAdmin: "Only the owner of this record or an admin can do this.",
} as const;

// The decision for one key. ownerId is the id of the user the record belongs to; it is
// needed only for "ownerOrAdmin" rules (unknown owner: only an admin passes).
export function decide(key: AccessKey, viewer: Viewer, ownerId?: number | null): Decision {
  const rule: Rule = ACCESS_RULES[key];
  if (rule === "public") return { ok: true, status: 200 };
  if (!viewer) return { ok: false, status: 401, error: NOT_LOGGED_IN };
  if (rule === "loggedIn" || viewer.role === "ADMIN") return { ok: true, status: 200 };
  if (rule === "ownerOrAdmin" && ownerId != null && viewer.id === ownerId) return { ok: true, status: 200 };
  return { ok: false, status: 403, error: "Forbidden", reason: REASONS[rule] };
}

// For the views: whether to show a button. Only looks; the guard is the real check.
export function can(key: AccessKey, viewer: Viewer, ownerId?: number | null): boolean {
  return decide(key, viewer, ownerId).ok;
}

// The rule of a page path, for proxy.ts: "/users/12/edit" -> the rule of "page /users/[id]/edit".
// Unknown paths (the 404 page) are public.
const PAGE_PATTERNS = (Object.keys(ACCESS_RULES) as AccessKey[])
  .filter((key) => key.startsWith("page "))
  .map((key) => {
    const route = key.slice("page ".length);
    const pattern = new RegExp(`^${route.replace(/\[[^\]]+\]/g, "[^/]+")}/?$`);
    return { pattern, rule: ACCESS_RULES[key] as Rule };
  });

export function pageRule(pathname: string): Rule {
  return PAGE_PATTERNS.find((p) => p.pattern.test(pathname))?.rule ?? "public";
}

// Where to go after login: `next` only if it is a relative path on this site (one leading
// "/", no "//" or "/\", no scheme), so /login?next= can't send anyone to another site.
export function safeNext(next: unknown): string | null {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  if (/[\u0000-\u001f\\]/.test(next)) return null;
  const url = new URL(next, "http://homecoming.invalid");
  if (url.origin !== "http://homecoming.invalid" || url.pathname.startsWith("/login")) return null;
  return url.pathname + url.search + url.hash;
}

// The login URL that comes back to `path` afterwards.
export function loginUrl(path: string): string {
  const next = safeNext(path);
  return next && next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login";
}
