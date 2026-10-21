import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as UserController from "@/controllers/UserController";
import UserDetails from "@/components/UserDetails";
import UserNav from "@/components/UserNav";
import DeleteUserButton from "@/components/DeleteUserButton";
import { deleteUserAction } from "../actions";

export const metadata: Metadata = {
  title: "User details | Alumni Tracking System",
};

// GET /users/[id]: one user (Read). Delete posts back to this page.
export default async function UserPage({ params, searchParams }: PageProps<"/users/[id]">) {
  await connection();
  const { id } = await params;
  const { updated } = await searchParams;
  const { ok, data: user } = await UserController.show(id);
  if (!ok) notFound();

  return (
    <main className="container stack">
      <UserNav userId={user.id} />

      <section className="panel">
        {updated && (
          <p className="notice" role="status">
            Changes saved.
          </p>
        )}
        <h2 className="section-title">{user.fullName}</h2>
        <UserDetails user={user} />
        <div className="button-row">
          <Link href={`/users/${user.id}/edit`} className="button primary">Edit</Link>
          <DeleteUserButton action={deleteUserAction.bind(null, user.id)} name={user.fullName} />
        </div>
      </section>
    </main>
  );
}
