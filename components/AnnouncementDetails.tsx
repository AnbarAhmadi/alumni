import type { Announcement } from "@/models/Announcement";

// createdAt is stored as an ISO string; show it as e.g. "7 Oct 2026, 11:15" (Istanbul time).
export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  });
}

// One announcement shown as key/value pairs.
export default function AnnouncementDetails({ announcement }: { announcement: Announcement }) {
  const rows: [string, string | number][] = [
    ["ID", announcement.id],
    ["Title", announcement.title],
    ["Author", announcement.author ?? "—"],
    ["Created", formatDate(announcement.createdAt)],
    ["Content", announcement.content],
  ];

  return (
    <dl className="details">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          {/* pre-wrap keeps the line breaks typed into the content box */}
          <dd style={{ whiteSpace: "pre-wrap" }}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
