"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as UserController from "@/controllers/UserController";
import type { UserFormState } from "@/components/UserForm";

// The typed values, sent back on an error so the form keeps them.
function typedValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const name of ["fullName", "email", "age", "school"]) {
    values[name] = String(formData.get(name) ?? "");
  }
  return values;
}

export async function createUserAction(
  _state: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const result = UserController.create(formData);
  if (!result.ok) return { error: result.error, field: result.field, values: typedValues(formData) };

  revalidatePath("/users");
  redirect(`/users?created=${result.data.id}`);
}

export async function updateUserAction(
  id: number,
  _state: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const result = UserController.update(id, formData);
  if (!result.ok) return { error: result.error, field: result.field, values: typedValues(formData) };

  revalidatePath("/users");
  redirect(`/users/${id}?updated=1`);
}

export async function deleteUserAction(id: number) {
  UserController.remove(id);
  revalidatePath("/users");
  redirect("/users");
}
