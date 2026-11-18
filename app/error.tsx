"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import StatusPage from "@/components/StatusPage";

// The 500 page of the website, inside the shared layout. Shown when a page throws,
// for example when the database is down. It never shows the error: in production
// Next.js only sends a generic message and a digest to the browser, and this page
// shows neither. The full error is printed in the server's terminal.
// "Try again" calls retry(), which fetches the page from the server again.
// Client components can't export metadata, so the tab title is a React <title>.
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <>
      <title>Something went wrong | Homecoming</title>
      <StatusPage code="500" line="Something went wrong on our side.">
        <button type="button" className="button primary" onClick={() => retry()}>
          Try again
        </button>
        <Link href="/" className="button">Back to the home page</Link>
      </StatusPage>
    </>
  );
}
