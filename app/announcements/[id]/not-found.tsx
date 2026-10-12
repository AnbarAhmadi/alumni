import AnnouncementNav from "@/components/AnnouncementNav";

// Shown by /announcements/[id] and /announcements/[id]/edit when no announcement has that id.
export default function AnnouncementNotFound() {
  return (
    <main className="container stack">
      <AnnouncementNav />
      <section className="panel">
        <h2 className="section-title">Announcement not found</h2>
        <p className="muted">
          There is no announcement with this id. It may have been deleted, or the link may be wrong.
        </p>
      </section>
    </main>
  );
}
