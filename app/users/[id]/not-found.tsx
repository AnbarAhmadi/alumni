import UserNav from "@/components/UserNav";

// Shown by /users/[id] and /users/[id]/edit when no user has that id.
export default function UserNotFound() {
  return (
    <main className="container stack">
      <UserNav />
      <section className="panel">
        <h2 className="section-title">User not found</h2>
        <p className="muted">
          There is no user with this id. They may have been deleted, or the link may be wrong.
        </p>
      </section>
    </main>
  );
}
