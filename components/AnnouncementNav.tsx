import Link from "next/link";

type Props = {
  announcementId?: number; // adds links to this announcement's details and edit pages
};

// Links between the announcement pages: list, new, details and edit.
export default function AnnouncementNav({ announcementId }: Props) {
  return (
    <nav className="user-nav" aria-label="Announcement pages">
      <Link href="/announcements">← All announcements</Link>
      {announcementId !== undefined && <Link href={`/announcements/${announcementId}`}>Details</Link>}
      {announcementId !== undefined && <Link href={`/announcements/${announcementId}/edit`}>Edit</Link>}
      <Link href="/announcements#new-announcement">+ New announcement</Link>
    </nav>
  );
}
