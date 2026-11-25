"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as MeController from "@/controllers/MeController";
import { guardForm } from "@/lib/guard";
import type { MeFormState } from "@/components/MeForms";

// The forms of /me and /me/applications (Week 10). Each one checks its own rule
// (lib/access.ts: logged in) and uses the SESSION user from guardForm, never an id from the form.

function fieldErrors(errors: { field: string; message: string }[]) {
  return Object.fromEntries(errors.map((e) => [e.field, e.message]));
}

export async function updateMyProfileAction(_state: MeFormState, formData: FormData): Promise<MeFormState> {
  const user = (await guardForm("form updateMyProfile", "/me"))!;
  const result = await MeController.updateProfile(user.id, formData);
  const values = { fullName: String(formData.get("fullName") ?? ""), school: String(formData.get("school") ?? ""), graduationYear: String(formData.get("graduationYear") ?? "") };
  if (!result.ok) return { errors: fieldErrors(result.errors ?? []), values };
  revalidatePath("/", "layout"); // the header shows the name
  return { done: "Your details are saved.", values };
}

// The passwords are never sent back to the form.
export async function changeMyPasswordAction(_state: MeFormState, formData: FormData): Promise<MeFormState> {
  const user = (await guardForm("form changeMyPassword", "/me"))!;
  const result = await MeController.changePassword(user.id, formData);
  if (!result.ok) return { errors: fieldErrors(result.errors ?? []) };
  return { done: "Your password is changed. You were logged out on your other devices." };
}

export async function withdrawApplicationAction(id: number) {
  const user = (await guardForm("form withdrawApplication", "/me/applications"))!;
  const withdrawn = await MeController.withdraw(user.id, id);
  revalidatePath("/me/applications");
  redirect(withdrawn ? "/me/applications?done=withdrawn" : "/me/applications?blocked=missing");
}
