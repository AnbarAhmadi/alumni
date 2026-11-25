import type { NextRequest } from "next/server";
import { remove, updateStatus } from "@/controllers/ApiApplicationController";
import { owners, withAuth } from "@/lib/guard";
import { withLogger } from "@/lib/withLogger";

type Ctx = RouteContext<"/api/applications/[id]">;

// PATCH /api/applications/[id] (Week 10): change an application's status (applied, reviewed,
// hired or rejected). Access rules: lib/access.ts. The owner of the posting, or an admin;
// never the applicant.
export const PATCH = withLogger(
  withAuth(
    "PATCH /api/applications/[id]",
    async (request: NextRequest, { params }: Ctx) => updateStatus(request, (await params).id),
    owners.applicationParam,
  ),
);

// DELETE /api/applications/[id] (Week 10, the admin panel): admin only.
export const DELETE = withLogger(
  withAuth("DELETE /api/applications/[id]", async (_request: NextRequest, { params }: Ctx) => remove((await params).id)),
);
