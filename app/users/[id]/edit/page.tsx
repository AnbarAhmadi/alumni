import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as UserController from "@/controllers/UserController";
import UserForm from "@/components/UserForm";
import { updateUserAction } from "../../actions";

// The tab title: "Edit user | Homecoming", or the 404 title if there is no such record.
export async function generateMetadata({ params }: PageProps<"/users/[id]/edit">): Promise<Metadata> {
  const { ok, data } = await UserController.show((await params).id);
  return { title: ok && data ? "Edit user | Homecoming" : "Page not found | Homecoming" };
}

// GET /users/[id]/edit: the edit form (Update). It posts back to this page.
export default async function EditUserPage({ params }: PageProps<"/users/[id]/edit">) {
  await connection();
  const { id } = await params;
  const { ok, data: user } = await UserController.show(id);
  if (!ok) notFound();

  return (
    <section className="reading" aria-labelledby="edit-user-title">
      <p className="page-back">
        <Link href={`/users/${user.id}`} className="text-link">
          <span aria-hidden="true">← </span>Back to {user.fullName}
        </Link>
      </p>
      <h1 id="edit-user-title">Edit user</h1>
      <p className="meta">Only the fields you change are updated; empty fields keep their current value.</p>
      <UserForm action={updateUserAction.bind(null, user.id)} user={user} submitLabel="Save changes" />
    </section>
  );
}
