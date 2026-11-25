import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as AdminController from "@/controllers/AdminController";
import * as UserDirectoryController from "@/controllers/UserDirectoryController";
import UserDetails from "@/components/UserDetails";
import JobPostingTable from "@/components/JobPostingTable";
import DeleteUserButton from "@/components/DeleteUserButton";
import { can } from "@/lib/access";
import { guardPage, viewerOf } from "@/lib/guard";
import { deleteUserAction } from "../actions";

// The tab title: "<name> | Homecoming", or the 404 title if there is no such record.
export async function generateMetadata({ params }: PageProps<"/users/[id]">): Promise<Metadata> {
  const { ok, data } = await UserDirectoryController.profile((await params).id);
  return { title: ok && data ? `${data.fullName} | Homecoming` : "Page not found | Homecoming" };
}

// GET /users/[id]: one user's profile and their job postings (Read). Delete posts back to this page.
export default async function UserPage({ params, searchParams }: PageProps<"/users/[id]">) {
  await connection();
  const { id } = await params;
  // Access (lib/access.ts): logged in; Edit and Delete only for this user or an admin.
  const viewer = viewerOf(await guardPage("page /users/[id]", `/users/${id}`));
  const { updated, blocked } = await searchParams;
  const blockedMessage = AdminController.BLOCKED[String(blocked) as AdminController.BlockedCode];
  const { ok, data: user } = await UserDirectoryController.profile(id);
  if (!ok || !user) notFound();

  return (
    <div className="stack reading">
      <section aria-labelledby="profile-title">
        <p className="page-back">
          <Link href="/users" className="text-link">
            <span aria-hidden="true">← </span>All users
          </Link>
        </p>
        {updated && (
          <p className="notice" role="status">
            Changes saved.
          </p>
        )}
        {blockedMessage && (
          <p className="notice notice-blocked" role="alert">
            {blockedMessage}
          </p>
        )}
        <UserDetails user={user} />
        {(can("page /users/[id]/edit", viewer, user.id) || can("form deleteUser", viewer, user.id)) && (
          <div className="button-row">
            {can("page /users/[id]/edit", viewer, user.id) && (
              <Link href={`/users/${user.id}/edit`} className="button primary">Edit</Link>
            )}
            {can("form deleteUser", viewer, user.id) && (
              <DeleteUserButton action={deleteUserAction.bind(null, user.id)} name={user.fullName} />
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="jobs-title">
        <h2 id="jobs-title" className="section-title">Job postings</h2>
        <JobPostingTable jobs={user.jobs} />
      </section>
    </div>
  );
}
