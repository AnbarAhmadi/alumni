import type { NextRequest } from "next/server";
import { changeRole } from "@/controllers/ApiUserController";
import { withAuth } from "@/lib/guard";
import { withLogger } from "@/lib/withLogger";

type Ctx = RouteContext<"/api/users/[id]/role">;

// PATCH /api/users/[id]/role (Week 10): change a user's role. Admin only (lib/access.ts);
// the last admin can't be demoted (409, models/User.ts).
export const PATCH = withLogger(
  withAuth("PATCH /api/users/[id]/role", async (request: NextRequest, { params }: Ctx) => changeRole(request, (await params).id)),
);
