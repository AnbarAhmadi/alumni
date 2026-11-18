import type { Metadata } from "next";
import { connection } from "next/server";
import * as UserDirectoryController from "@/controllers/UserDirectoryController";
import UserTable from "@/components/UserTable";
import UserForm from "@/components/UserForm";
import { createUserAction, deleteUserAction } from "./actions";

export const metadata: Metadata = {
  title: "Users | Homecoming",
};

// GET /users: the table of users with their alumni status (Read). The form below posts back to /users (Create).
export default async function UsersPage({ searchParams }: PageProps<"/users">) {
  // Users change at runtime, so render on every request.
  await connection();
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
          <a href="#new-user" className="button primary">Add a user</a>
        </div>
        <UserTable users={users} highlightId={Number(created)} deleteAction={deleteUserAction} />
      </section>

      <section id="new-user" className="card" aria-labelledby="new-user-title">
        <h2 id="new-user-title" className="section-title">Add a user</h2>
        <UserForm action={createUserAction} submitLabel="Add user" />
      </section>
    </div>
  );
}
