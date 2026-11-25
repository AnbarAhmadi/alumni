import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import * as AdminController from "@/controllers/AdminController";
import AdminUserTable from "@/components/AdminUserTable";
import { guardPage } from "@/lib/guard";
import { adminDeleteUserAction, changeRoleAction } from "./actions";

export const metadata: Metadata = {
  title: "Users | Admin | Homecoming",
};

// Plain words for the result of a form, shown at the top of the page.
const OTHER_BLOCKED: Record<string, string> = {
  invalid: "Choose Admin, Alumni or Student.",
  missing: "That user doesn't exist any more.",
};

// GET /admin/users (Week 10): every user with their role; change a role, edit or delete.
// Admin only (lib/access.ts). The safety rules (ddd.md) are checked in the model; when one
// blocks a change, the page says why.
export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  await connection();
  const admin = await guardPage("page /admin/users", "/admin/users");
  const { done, blocked, user } = await searchParams;
  const users = await AdminController.users();
  const target = users.find((u) => u.id === Number(user));

  const blockedMessage =
    AdminController.BLOCKED[String(blocked) as AdminController.BlockedCode] ?? OTHER_BLOCKED[String(blocked)];
  const doneMessage =
    done === "role" && target ? `${target.fullName} is now ${roleLabel(target.role)}.` : done === "deleted" ? "The user was deleted." : undefined;
  const admins = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="stack">
      <section aria-labelledby="admin-users-title">
        <p className="page-back">
          <Link href="/admin" className="text-link">
            <span aria-hidden="true">← </span>Admin
          </Link>
        </p>
        <div className="page-header">
          <div>
            <h1 id="admin-users-title">Users</h1>
            <p className="meta">
              {users.length === 1 ? "1 user" : `${users.length} users`}, {admins === 1 ? "1 admin" : `${admins} admins`}.
              You can&apos;t delete your own account here, and the last admin always stays an admin.
            </p>
          </div>
        </div>
        {doneMessage && (
          <p className="notice" role="status">
            {doneMessage}
          </p>
        )}
        {blockedMessage && (
          <p className="notice notice-blocked" role="alert">
            {blockedMessage}
          </p>
        )}
        <AdminUserTable
          users={users}
          currentUserId={admin!.id}
          changeRoleAction={changeRoleAction}
          deleteAction={adminDeleteUserAction}
        />
      </section>
    </div>
  );
}

function roleLabel(role: string) {
  return role === "ADMIN" ? "an admin" : role === "ALUMNI" ? "alumni" : "a student";
}
