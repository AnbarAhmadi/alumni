"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as AuthController from "@/controllers/AuthController";
import * as UserController from "@/controllers/UserController";
import type { UserFormState } from "@/components/UserForm";
import * as AdminController from "@/controllers/AdminController";
import { guardForm, viewerOf } from "@/lib/guard";

// Every action checks its own access rule (lib/access.ts): a server action can be called
// with a POST to any page, so the page that shows the form is not enough.

// The typed values, sent back on an error so the form keeps them.
function typedValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const name of ["fullName", "email", "age", "school"]) {
    values[name] = String(formData.get(name) ?? "");
  }
  return values;
}

// "Add a user" on /users: admin only.
export async function createUserAction(
  _state: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await guardForm("form createUser", "/users");
  const result = await UserController.create(formData);
  if (!result.ok) return { error: result.error, field: result.field, values: typedValues(formData) };

  revalidatePath("/users");
  redirect(`/users?created=${result.data.id}`);
}

// The edit form: that user or an admin.
export async function updateUserAction(
  id: number,
  _state: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await guardForm("form updateUser", `/users/${id}/edit`, id);
  const result = await UserController.update(id, formData);
  if (!result.ok) return { error: result.error, field: result.field, values: typedValues(formData) };

  revalidatePath("/users");
  redirect(`/users/${id}?updated=1`);
}

// Delete: that user or an admin. Deleting your own account also deletes your sessions
// (ON DELETE CASCADE), so the cookie is cleared and you go to the home page.
// The safety rules (ddd.md) may refuse it: then back to the profile with their message.
export async function deleteUserAction(id: number) {
  const user = await guardForm("form deleteUser", `/users/${id}`, id);
  const result = await UserController.remove(id, viewerOf(user));
  const blocked = AdminController.blockedCode(result.error);
  if (blocked) redirect(`/users/${id}?blocked=${blocked}`);
  revalidatePath("/users");
  if (user?.id === id) {
    await AuthController.logout();
    redirect("/");
  }
  redirect("/users");
}
