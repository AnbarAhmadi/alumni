import Link from "next/link";
import type { Announcement } from "@/models/Announcement";
import DeleteAnnouncementButton from "./DeleteAnnouncementButton";
import EmptyState from "./EmptyState";
import { formatDay } from "./AnnouncementDetails";

type Props = {
  announcements: Announcement[];
  highlightId?: number; // a just-posted announcement, shown with a notice
  // Server action that deletes the announcement with the given id.
  deleteAction: (id: number) => Promise<void>;
};

// Newest first: by date, then by id for announcements posted at the same moment.
function newestFirst(a: Announcement, b: Announcement) {
  return b.createdAt.localeCompare(a.createdAt) || b.id - a.id;
}

// The announcements as cards: date badge, title, two lines of the message, "Read more".
export default function AnnouncementList({ announcements, highlightId, deleteAction }: Props) {
  if (announcements.length === 0) {
    return (
      <EmptyState
        message="No announcements yet. Post the first one."
        action={{ href: "#new-announcement", label: "Post an announcement" }}
      />
    );
  }

  const created = announcements.find((a) => a.id === highlightId);
  const sorted = [...announcements].sort(newestFirst);

  return (
    <>
      {created && (
        <p className="notice" role="status">
          Added &ldquo;{created.title}&rdquo;.
        </p>
      )}
      <ul className="card-list">
        {sorted.map((announcement) => {
          const href = `/announcements/${announcement.id}`;
          const titleId = `announcement-${announcement.id}-title`;
          return (
            <li key={announcement.id}>
              <article
                className={announcement.id === highlightId ? "card is-new" : "card"}
                aria-labelledby={titleId}
              >
                <p className="badge">
                  <time dateTime={announcement.createdAt}>{formatDay(announcement.createdAt)}</time>
                </p>
                <h2 id={titleId} className="card-title">
                  <Link href={href}>{announcement.title}</Link>
                </h2>
                <p className="card-text preview">{announcement.content}</p>
                <div className="card-footer">
                  <Link href={href} className="text-link">
                    Read more<span className="visually-hidden">: {announcement.title}</span>
                    <span aria-hidden="true"> →</span>
                  </Link>
                  <div className="button-row">
                    <Link href={`${href}/edit`} className="button">
                      Edit<span className="visually-hidden"> {announcement.title}</span>
                    </Link>
                    <DeleteAnnouncementButton
                      action={deleteAction.bind(null, announcement.id)}
                      title={announcement.title}
                    />
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </>
  );
}
