"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as AdminController from "@/controllers/AdminController";
import { guardForm, viewerOf } from "@/lib/guard";

// The forms of /admin/users (Week 10). Each one checks its own rule (lib/access.ts: admin
// only); the safety rules are checked in the model. The result comes back as a short code
// in the URL, so the page can show it with or without JavaScript.

// The role dropdown and Save button of one row.
export async function changeRoleAction(id: number, formData: FormData) {
  const admin = await guardForm("form changeRole", "/admin/users");
  const result = await AdminController.changeRole(id, formData);
  const blocked = AdminController.blockedCode(result.error);
  if (blocked) redirect(`/admin/users?blocked=${blocked}&user=${id}`);
  if (!result.ok) redirect(`/admin/users?blocked=invalid&user=${id}`);

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  // An admin who gave up their own admin role can't see the panel any more.
  if (admin?.id === id && result.data!.role !== "ADMIN") redirect("/");
  redirect(`/admin/users?done=role&user=${id}`);
}

// The Delete button of one row (with a confirmation in the browser).
export async function adminDeleteUserAction(id: number) {
  const admin = await guardForm("form adminDeleteUser", "/admin/users");
  const result = await AdminController.remove(id, viewerOf(admin));
  const blocked = AdminController.blockedCode(result.error);
  if (blocked) redirect(`/admin/users?blocked=${blocked}&user=${id}`);

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/users");
  redirect(result.ok ? "/admin/users?done=deleted" : "/admin/users?blocked=missing");
}
