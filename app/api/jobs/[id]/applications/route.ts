import type { NextRequest } from "next/server";
import { createForJob, getForJob } from "@/controllers/ApiApplicationController";
import { owners, withAuth } from "@/lib/guard";
import { withLogger } from "@/lib/withLogger";

type Ctx = RouteContext<"/api/jobs/[id]/applications">;

// Access rules: lib/access.ts. The applicants: the posting's owner or an admin.
// Applying: any logged-in user, and the applicant is always the session user.
export const GET = withLogger(
  withAuth(
    "GET /api/jobs/[id]/applications",
    async (request: NextRequest, { params }: Ctx) => getForJob(request, (await params).id),
    owners.jobPostingParam,
  ),
);
export const POST = withLogger(
  withAuth("POST /api/jobs/[id]/applications", async (_request: NextRequest, { params }: Ctx, user) =>
    createForJob((await params).id, user!.id),
  ),
);
