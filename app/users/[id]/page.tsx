import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as UserController from "@/controllers/UserController";
import UserDetails from "@/components/UserDetails";
import UserForm from "@/components/UserForm";
import DeleteUserButton from "@/components/DeleteUserButton";
import { deleteUserAction, updateUserAction } from "../actions";

export const metadata: Metadata = {
  title: "User details | Alumni Tracking System",
};

export default async function UserPage({ params }: PageProps<"/users/[id]">) {
  await connection();
  const { id } = await params;
  const user = UserController.show(id);
  if (!user) notFound();

  return (
    <main className="container stack">
      <p>
        <Link href="/users">← All users</Link>
      </p>

      <section className="panel">
        <h2 className="section-title">{user.fullName}</h2>
        <UserDetails user={user} />
        <DeleteUserButton action={deleteUserAction.bind(null, user.id)} />
      </section>

      <section className="panel">
        <h2 className="section-title">Edit</h2>
        <p className="muted">Fields left empty keep their current value.</p>
        <UserForm action={updateUserAction.bind(null, user.id)} user={user} submitLabel="Save changes" />
      </section>
    </main>
  );
}
