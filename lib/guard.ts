// The access guard (Week 10): applies the rules of lib/access.ts at every entry point.
//   withAuth(key, handler, owner?)   API route handlers, inside withLogger: 401 / 403 JSON
//   guardPage(key, path, ownerId?)   pages: redirect to /login?next=..., or the 403 page
//   guardForm(key, path, ownerId?)   server actions (forms and buttons): the same as pages
// Every one of them calls decide() from lib/access.ts, so the rules live in one place.
// Server actions are separate entry points (a POST to any page), so they are checked
// themselves, never only through the page that shows the form.
import { cache } from "react";
import { forbidden, redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { ApplicationModel } from "@/models/Application";
import { JobPostingModel } from "@/models/JobPosting";
import type { UserAccount } from "@/models/User";
import { decide, loginUrl, type AccessKey, type Viewer } from "./access";
import { destroySession, getCurrentUser, hasSessionCookie } from "./session";

// The logged-in user, looked up once per request (the layout, the page and the guard share it).
export const currentUser = cache(getCurrentUser);

export function viewerOf(user: UserAccount | null): Viewer {
  return user && { id: user.id, role: user.role };
}

// "12" -> 12; anything else -> null (an unknown owner: only an admin passes).
export function idFrom(param: string): number | null {
  return /^\d+$/.test(param) ? Number(param) : null;
}

// ---------- API route handlers ----------

// Finds the owner of the record a request is about, from the route context.
type OwnerOf<C> = (ctx: C) => Promise<number | null>;

// Owner lookups for the API's "owner or admin" rules (ddd.md, Access rules).
export const owners = {
  // /api/users/[id]...: the owner is the user [id] itself.
  userParam: async (ctx: { params: Promise<{ id: string }> }) => idFrom((await ctx.params).id),
  // /api/jobs/[id]...: the owner is the user who owns the posting.
  jobPostingParam: async (ctx: { params: Promise<{ id: string }> }) => {
    const id = idFrom((await ctx.params).id);
    return id === null ? null : ((await JobPostingModel.getById(id))?.userId ?? null);
  },
  // /api/applications/[id]: the owner is the user who owns the application's posting
  // (not the applicant, who may not change their own status).
  applicationParam: async (ctx: { params: Promise<{ id: string }> }) => {
    const id = idFrom((await ctx.params).id);
    const application = id === null ? null : await ApplicationModel.getById(id);
    return application ? ((await JobPostingModel.getById(application.jobPostingId))?.userId ?? null) : null;
  },
};

// Wraps a route handler: answers 401 or 403 JSON (same shape as the other errors), or
// calls the handler with the logged-in user. A session cookie that no longer works is cleared.
export function withAuth<R extends Request, C = unknown>(
  key: AccessKey,
  handler: (request: R, ctx: C, user: UserAccount | null) => Response | Promise<Response>,
  ownerOf?: OwnerOf<C>,
) {
  return async (request: R, ctx: C): Promise<Response> => {
    const user = await currentUser();
    const ownerId = ownerOf && user && user.role !== "ADMIN" ? await ownerOf(ctx) : null;
    const decision = decide(key, viewerOf(user), ownerId);
    if (decision.status === 200) return handler(request, ctx, user);

    if (decision.status === 401) {
      if (await hasSessionCookie()) await destroySession();
      return NextResponse.json({ error: decision.error }, { status: 401 });
    }
    return NextResponse.json({ error: decision.error, reason: decision.reason }, { status: 403 });
  };
}

// ---------- Pages and server actions ----------

// For pages: returns the logged-in user (or null on a public page). Not logged in:
// redirect to /login?next=<path>. Logged in without access: the 403 page (app/forbidden.tsx).
export async function guardPage(key: AccessKey, path: string, ownerId?: number | null): Promise<UserAccount | null> {
  const user = await currentUser();
  const decision = decide(key, viewerOf(user), ownerId);
  if (decision.status === 200) return user;
  if (decision.status === 401) redirect(loginUrl(path));
  forbidden();
}

// For server actions: the same checks. redirect() in a server action is a 303.
export const guardForm = guardPage;
