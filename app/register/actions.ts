"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as AuthController from "@/controllers/AuthController";
import * as UserController from "@/controllers/UserController";
import type { RegisterFormState } from "@/components/RegisterForm";

// Sent back on an error so the form keeps them. The two passwords are never sent back.
const KEPT_FIELDS = ["fullName", "email", "role", "graduationYear", "school"];

function typedValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const name of KEPT_FIELDS) values[name] = String(formData.get(name) ?? "");
  return values;
}

// The /register form. On success, the new user is logged in, then a 303 redirect to their page (Next.js uses
// 303 for redirect() in a server action; with JavaScript it is a client-side navigation).
export async function registerAction(_state: RegisterFormState, formData: FormData): Promise<RegisterFormState> {
  const result = await UserController.register(formData);
  if (!result.ok) {
    const errors = Object.fromEntries((result.errors ?? []).map((e) => [e.field, e.message]));
    return { errors, error: result.errors?.length ? undefined : result.error, values: typedValues(formData) };
  }

  // Week 10: a new account is logged in straight away (a session and its cookie).
  await AuthController.startSession(result.data!.id);
  revalidatePath("/users");
  redirect(`/users/${result.data!.id}`);
}
