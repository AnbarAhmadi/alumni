import Link from "next/link";
import type { Announcement } from "@/models/Announcement";
import DeleteAnnouncementButton from "./DeleteAnnouncementButton";
import { formatDate } from "./AnnouncementDetails";

type Props = {
  announcements: Announcement[];
  highlightId?: number; // a just-created announcement, shown with a notice
  // Server action that deletes the announcement with the given id.
  deleteAction: (id: number) => Promise<void>;
};

export default function AnnouncementTable({ announcements, highlightId, deleteAction }: Props) {
  if (announcements.length === 0) {
    return <p className="empty">No announcements yet. Add one with the form below.</p>;
  }

  const created = announcements.find((a) => a.id === highlightId);

  return (
    <>
      {created && (
        <p className="notice" role="status">
          Added &ldquo;{created.title}&rdquo;.
        </p>
      )}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Created</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {announcements.map((announcement) => (
              <tr key={announcement.id} className={announcement.id === highlightId ? "highlight" : undefined}>
                <td>{announcement.id}</td>
                <td>
                  <Link href={`/announcements/${announcement.id}`}>{announcement.title}</Link>
                </td>
                <td>{announcement.author ?? "—"}</td>
                <td>{formatDate(announcement.createdAt)}</td>
                <td className="actions">
                  <Link href={`/announcements/${announcement.id}`} className="button">View</Link>
                  <Link href={`/announcements/${announcement.id}/edit`} className="button">Edit</Link>
                  <DeleteAnnouncementButton
                    action={deleteAction.bind(null, announcement.id)}
                    title={announcement.title}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
