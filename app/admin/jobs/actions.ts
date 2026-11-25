"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as AdminController from "@/controllers/AdminController";
import type { JobPostingFormState } from "@/components/JobPostingForm";
import { guardForm } from "@/lib/guard";

// The forms of /admin/jobs and /admin/jobs/[id]/edit (Week 10). Each one checks its own
// rule (lib/access.ts: admin only).

function typedValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const name of ["userId", "title", "company", "city", "description"]) values[name] = String(formData.get(name) ?? "");
  return values;
}

function revalidateJobs() {
  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function adminCreateJobAction(_state: JobPostingFormState, formData: FormData): Promise<JobPostingFormState> {
  await guardForm("form adminCreateJob", "/admin/jobs");
  const result = await AdminController.createJob(formData);
  if (!result.ok) return { error: result.error, field: result.field, values: typedValues(formData) };

  revalidateJobs();
  redirect(`/admin/jobs?done=created&item=${result.data!.id}`);
}

export async function adminUpdateJobAction(
  id: number,
  _state: JobPostingFormState,
  formData: FormData,
): Promise<JobPostingFormState> {
  await guardForm("form adminUpdateJob", `/admin/jobs/${id}/edit`);
  const result = await AdminController.updateJob(id, formData);
  if (!result.ok) return { error: result.error, field: result.field, values: typedValues(formData) };

  revalidateJobs();
  redirect(`/admin/jobs?done=updated&item=${id}`);
}

export async function adminDeleteJobAction(id: number) {
  await guardForm("form adminDeleteJob", "/admin/jobs");
  const deleted = await AdminController.removeJob(id);
  revalidateJobs();
  redirect(deleted ? "/admin/jobs?done=deleted" : "/admin/jobs?blocked=missing");
}
