import type { NextRequest } from "next/server";
import { getForUser } from "@/controllers/ApiApplicationController";
import { owners, withAuth } from "@/lib/guard";
import { withLogger } from "@/lib/withLogger";

type Ctx = RouteContext<"/api/users/[id]/applications">;

// Access rules: lib/access.ts. A user's applications: that user or an admin.
export const GET = withLogger(
  withAuth(
    "GET /api/users/[id]/applications",
    async (request: NextRequest, { params }: Ctx) => getForUser(request, (await params).id),
    owners.userParam,
  ),
);
