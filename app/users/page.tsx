import type { Metadata } from "next";
import { connection } from "next/server";
import * as UserDirectoryController from "@/controllers/UserDirectoryController";
import UserTable from "@/components/UserTable";
import UserForm from "@/components/UserForm";
import { can } from "@/lib/access";
import { guardPage, viewerOf } from "@/lib/guard";
import { createUserAction, deleteUserAction } from "./actions";

export const metadata: Metadata = {
  title: "Users | Homecoming",
};

// GET /users: the table of users with their alumni status (Read). The form below posts back to /users (Create).
// Access (lib/access.ts): logged in; the "Add a user" form only for an admin.
export default async function UsersPage({ searchParams }: PageProps<"/users">) {
  // Users change at runtime, so render on every request.
  await connection();
  const viewer = viewerOf(await guardPage("page /users", "/users"));
  const canAdd = can("form createUser", viewer);
  const { data: users = [] } = await UserDirectoryController.index();
  const { created } = await searchParams;
  const alumni = users.filter((user) => user.isAlumni).length;

  return (
    <div className="stack">
      <section aria-labelledby="users-title">
        <div className="page-header">
          <div>
            <h1 id="users-title">Users</h1>
            <p className="meta">
              {users.length === 1 ? "1 user" : `${users.length} users`}, {alumni} of them alumni.
            </p>
          </div>
          {canAdd && <a href="#new-user" className="button primary">Add a user</a>}
        </div>
        <UserTable users={users} highlightId={Number(created)} deleteAction={deleteUserAction} viewer={viewer} />
      </section>

      {canAdd && (
        <section id="new-user" className="card" aria-labelledby="new-user-title">
          <h2 id="new-user-title" className="section-title">Add a user</h2>
          <UserForm action={createUserAction} submitLabel="Add user" />
        </section>
      )}
    </div>
  );
}
