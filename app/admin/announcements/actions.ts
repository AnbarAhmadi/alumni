"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as AdminController from "@/controllers/AdminController";
import type { AnnouncementFormState } from "@/components/AnnouncementForm";
import { guardForm } from "@/lib/guard";

// The forms of /admin/announcements (Week 10). Each one checks its own rule (lib/access.ts:
// admin only). Editing uses /announcements/[id]/edit and its own guarded action.

function typedValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const name of ["title", "content", "author"]) values[name] = String(formData.get(name) ?? "");
  return values;
}

export async function adminCreateAnnouncementAction(
  _state: AnnouncementFormState,
  formData: FormData,
): Promise<AnnouncementFormState> {
  await guardForm("form adminCreateAnnouncement", "/admin/announcements");
  const result = await AdminController.createAnnouncement(formData);
  if (!result.ok) return { error: result.error, field: result.field, values: typedValues(formData) };

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  redirect(`/admin/announcements?done=created&item=${result.data!.id}`);
}

export async function adminDeleteAnnouncementAction(id: number) {
  await guardForm("form adminDeleteAnnouncement", "/admin/announcements");
  const result = await AdminController.removeAnnouncement(id);
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  redirect(result.ok ? "/admin/announcements?done=deleted" : "/admin/announcements?blocked=missing");
}
