import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as UserController from "@/controllers/UserController";
import UserForm from "@/components/UserForm";
import UserNav from "@/components/UserNav";
import { updateUserAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit user | Alumni Tracking System",
};

// GET /users/[id]/edit: the edit form (Update). It posts back to this page.
export default async function EditUserPage({ params }: PageProps<"/users/[id]/edit">) {
  await connection();
  const { id } = await params;
  const { ok, data: user } = await UserController.show(id);
  if (!ok) notFound();

  return (
    <main className="container stack">
      <UserNav userId={user.id} />

      <section className="panel">
        <h2 className="section-title">Edit {user.fullName}</h2>
        <p className="muted">Only the fields you change are updated; empty fields keep their current value.</p>
        <UserForm action={updateUserAction.bind(null, user.id)} user={user} submitLabel="Save changes" />
      </section>
    </main>
  );
}
