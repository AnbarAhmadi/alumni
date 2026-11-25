"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as AdminController from "@/controllers/AdminController";
import { guardForm } from "@/lib/guard";

// The forms of /admin/applications (Week 10). Each one checks its own rule (lib/access.ts:
// admin only); the allowed statuses are checked in the model.

// The status dropdown and Save button of one row.
export async function adminChangeApplicationStatusAction(id: number, formData: FormData) {
  await guardForm("form adminChangeApplicationStatus", "/admin/applications");
  const result = await AdminController.changeApplicationStatus(id, formData);
  if (!result.ok) {
    redirect(`/admin/applications?blocked=${result.field === "status" ? "status" : "missing"}&item=${id}`);
  }
  revalidatePath("/admin/applications");
  redirect(`/admin/applications?done=status&item=${id}`);
}

export async function adminDeleteApplicationAction(id: number) {
  await guardForm("form adminDeleteApplication", "/admin/applications");
  const deleted = await AdminController.removeApplication(id);
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
  redirect(deleted ? "/admin/applications?done=deleted" : "/admin/applications?blocked=missing");
}
