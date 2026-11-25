import type { Metadata } from "next";
import Link from "next/link";
import StatusPage from "@/components/StatusPage";

export const metadata: Metadata = {
  title: "No access | Homecoming",
};

// The 403 page (Week 10), inside the shared layout. Shown with status 403 when a
// logged-in user opens a page or uses a form their role doesn't allow (lib/guard.ts
// calls forbidden(); needs experimental.authInterrupts in next.config.ts).
// Someone who isn't logged in never sees it: they go to /login instead.
export default function Forbidden() {
  return (
    <StatusPage code="403" line="Your account can't open this page. Only its owner or an admin can.">
      <Link href="/" className="button primary">Back to the home page</Link>
      <Link href="/users" className="button">Find a graduate</Link>
    </StatusPage>
  );
}
