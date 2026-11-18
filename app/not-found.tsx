import Link from "next/link";

// The one 404 page of the website, inside the root layout (header and footer).
// Shown for any unknown page URL (/banana) and whenever a page calls notFound(),
// for example /users/abc or /users/9999 (no user with that id).
// The JSON API has its own 404 (lib/notFound.ts) and never shows this page.
export default function NotFound() {
  return (
    <main className="container stack">
      <section className="panel">
        <h2 className="section-title">Page not found</h2>
        <p className="muted">
          The page you are looking for does not exist. The link may be wrong, or the record may have been deleted.
        </p>
        <div className="button-row">
          <Link href="/" className="button primary">Back to the home page</Link>
        </div>
      </section>
    </main>
  );
}
