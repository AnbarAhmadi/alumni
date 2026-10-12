import type { Metadata } from "next";
import { connection } from "next/server";
import * as UserController from "@/controllers/UserController";
import UserTable from "@/components/UserTable";
import UserForm from "@/components/UserForm";
import { createUserAction, deleteUserAction } from "./actions";

export const metadata: Metadata = {
  title: "Users | Alumni Tracking System",
};

// GET /users: list (Read). The form below posts back to /users (Create).
export default async function UsersPage({ searchParams }: PageProps<"/users">) {
  // Users live in memory and change at runtime, so render on every request.
  await connection();
  const { data: users } = UserController.index();
  const { created } = await searchParams;

  return (
    <main className="container stack">
      <section>
        <div className="page-header">
          <h2 className="section-title">Users ({users.length})</h2>
          <a href="#new-user" className="button primary">+ New user</a>
        </div>
        <UserTable users={users} highlightId={Number(created)} deleteAction={deleteUserAction} />
      </section>

      <section id="new-user" className="panel">
        <h2 className="section-title">Add a user</h2>
        <UserForm action={createUserAction} submitLabel="Create user" />
      </section>
    </main>
  );
}
