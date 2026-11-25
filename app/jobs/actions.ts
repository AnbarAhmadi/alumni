"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as JobsController from "@/controllers/JobsController";
import { guardForm } from "@/lib/guard";

// The Apply button of /jobs (Week 10). Checks its own rule (lib/access.ts: logged in) and
// applies as the SESSION user from guardForm; only the posting's id is bound to the button.
export async function applyToJobAction(jobPostingId: number) {
  const user = (await guardForm("form applyToJob", "/jobs"))!;
  const result = await JobsController.apply(user.id, jobPostingId);
  revalidatePath("/jobs");
  revalidatePath("/me/applications");
  redirect(result === "applied" ? `/jobs?done=applied&item=${jobPostingId}` : `/jobs?blocked=${result}&item=${jobPostingId}`);
}
