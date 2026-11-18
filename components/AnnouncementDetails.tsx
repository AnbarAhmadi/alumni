import type { Announcement } from "@/models/Announcement";

// createdAt is stored as an ISO string; show it as e.g. "7 Oct 2026, 11:15" (Istanbul time).
export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  });
}

// The day only, e.g. "7 Oct 2026" (Istanbul time), for the date badge in the list.
export function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    dateStyle: "medium",
    timeZone: "Europe/Istanbul",
  });
}

// One announcement's date and full message. The page shows the title above it.
export default function AnnouncementDetails({ announcement }: { announcement: Announcement }) {
  return (
    <>
      <p className="meta">
        Posted <time dateTime={announcement.createdAt}>{formatDate(announcement.createdAt)}</time>
      </p>
      <div className="message">{announcement.content}</div>
    </>
  );
}
