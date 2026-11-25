"use server";

import { redirect } from "next/navigation";
import * as AuthController from "@/controllers/AuthController";
import type { LoginFormState } from "@/components/LoginForm";
import { safeNext } from "@/lib/access";

// The /login form. On success, a 303 redirect (redirect() in a server action; with
// JavaScript it is a client-side navigation) to `next` when it is a safe relative path
// (lib/access.ts safeNext), else to the home page. On an error, the form again with the
// email kept; the password is never sent back.
export async function loginAction(_state: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const result = await AuthController.login(formData);
  if (!result.ok) return { error: result.error, field: result.field, email: String(formData.get("email") ?? "") };
  redirect(safeNext(formData.get("next")) ?? "/");
}

// The Log out button in the header: deletes the session, clears the cookie, goes home.
export async function logoutAction() {
  await AuthController.logout();
  redirect("/");
}
