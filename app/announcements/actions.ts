"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as AnnouncementController from "@/controllers/AnnouncementController";
// Same { error, field, values } shape as the user forms, so the type is reused.
import type { UserFormState as AnnouncementFormState } from "@/components/UserForm";
import { guardForm } from "@/lib/guard";

// Writing announcements is admin only (lib/access.ts). Every action checks it itself.

// The typed values, sent back on an error so the form keeps them.
function typedValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const name of ["title", "content", "author"]) {
    values[name] = String(formData.get(name) ?? "");
  }
  return values;
}

export async function createAnnouncementAction(
  _state: AnnouncementFormState,
  formData: FormData,
): Promise<AnnouncementFormState> {
  await guardForm("form createAnnouncement", "/announcements");
  const result = await AnnouncementController.create(formData);
  if (!result.ok) return { error: result.error, field: result.field, values: typedValues(formData) };

  revalidatePath("/announcements");
  redirect(`/announcements?created=${result.data.id}`);
}

export async function updateAnnouncementAction(
  id: number,
  _state: AnnouncementFormState,
  formData: FormData,
): Promise<AnnouncementFormState> {
  await guardForm("form updateAnnouncement", `/announcements/${id}/edit`);
  const result = await AnnouncementController.update(id, formData);
  if (!result.ok) return { error: result.error, field: result.field, values: typedValues(formData) };

  revalidatePath("/announcements");
  redirect(`/announcements/${id}?updated=1`);
}

export async function deleteAnnouncementAction(id: number) {
  await guardForm("form deleteAnnouncement", `/announcements/${id}`);
  await AnnouncementController.remove(id);
  revalidatePath("/announcements");
  redirect("/announcements");
}
