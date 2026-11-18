import type { Metadata } from "next";
import Link from "next/link";
import StatusPage from "@/components/StatusPage";

export const metadata: Metadata = {
  title: "Page not found | Homecoming",
};

// The one 404 page of the website, inside the shared layout (header and footer).
// Shown for any unknown page URL (/banana) and whenever a page calls notFound(),
// for example /users/abc or /users/9999 (no user with that id).
// The JSON API has its own 404 (lib/notFound.ts) and never shows this page.
export default function NotFound() {
  return (
    <StatusPage code="404" line="There is no page at this address.">
      <Link href="/" className="button primary">Back to the home page</Link>
    </StatusPage>
  );
}
