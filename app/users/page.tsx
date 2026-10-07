import type { Metadata } from "next";
import { connection } from "next/server";
import * as UserController from "@/controllers/UserController";
import UserTable from "@/components/UserTable";
import UserForm from "@/components/UserForm";
import { createUserAction, deleteUserAction } from "./actions";

export const metadata: Metadata = {
  title: "Users | Alumni Tracking System",
};

export default async function UsersPage() {
  // Users live in memory and change at runtime, so render on every request.
  await connection();
  const users = UserController.index();

  return (
    <main className="container stack">
      <section>
        <h2 className="section-title">Users ({users.length})</h2>
        <UserTable users={users} deleteAction={deleteUserAction} />
      </section>

      <section className="panel">
        <h2 className="section-title">Add a user</h2>
        <UserForm action={createUserAction} submitLabel="Create user" />
      </section>
    </main>
  );
}
