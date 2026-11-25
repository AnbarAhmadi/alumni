import type { NextRequest } from "next/server";
import { removeById, updateById } from "@/controllers/ApiUserJobController";
import { withAuth } from "@/lib/guard";
import { withLogger } from "@/lib/withLogger";

type Ctx = RouteContext<"/api/jobs/[id]">;

// One job posting by its id (Week 10, for the admin panel). Admin only (lib/access.ts).
export const PATCH = withLogger(
  withAuth("PATCH /api/jobs/[id]", async (request: NextRequest, { params }: Ctx) => updateById(request, (await params).id)),
);
export const DELETE = withLogger(
  withAuth("DELETE /api/jobs/[id]", async (_request: NextRequest, { params }: Ctx) => removeById((await params).id)),
);
