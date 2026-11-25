import type { NextRequest } from "next/server";
import { create, getAll } from "@/controllers/ApiUserJobController";
import { withAuth } from "@/lib/guard";
import { withLogger } from "@/lib/withLogger";

type Ctx = RouteContext<"/api/users/[id]/jobs">;

// Access rules: lib/access.ts. Job postings are created by an admin only.
export const GET = withLogger(
  withAuth("GET /api/users/[id]/jobs", async (request: NextRequest, { params }: Ctx) => getAll(request, (await params).id)),
);
export const POST = withLogger(
  withAuth("POST /api/users/[id]/jobs", async (request: NextRequest, { params }: Ctx) => create(request, (await params).id)),
);
