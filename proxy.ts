// Optimistic first check for pages (Week 10). Runs before a page renders and only looks at
// whether a session cookie is there, never at the database: a page that needs login and
// gets no cookie is sent straight to /login?next=<path> with a 303. Everything else goes
// on to the page, whose own guard (lib/guard.ts guardPage) does the real check (a valid,
// unexpired session, the role and the owner). Server actions (POST) and the API are not
// handled here: they are checked by their own guards.
import { NextResponse, type NextRequest } from "next/server";
import { loginUrl, pageRule } from "@/lib/access";
import { SESSION_COOKIE } from "@/lib/sessionCookie";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();
  if (pageRule(pathname) === "public" || request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  return NextResponse.redirect(new URL(loginUrl(pathname + search), request.url), 303);
}

export const config = {
  // Pages only: not the API, Next's own files or files with an extension (favicon.ico).
  matcher: ["/((?!api/|_next/|.*\\.[^/]+$).*)"],
};
