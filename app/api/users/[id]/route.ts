import type { NextRequest } from "next/server";
import { getById, remove, replace, update } from "@/controllers/ApiUserController";
import { owners, viewerOf, withAuth } from "@/lib/guard";
import { withLogger } from "@/lib/withLogger";

type Ctx = RouteContext<"/api/users/[id]">;

// Access rules: lib/access.ts. Changing or deleting a user: that user or an admin.
// Deleting also follows the safety rules (an admin can't delete themselves or the last admin).
export const GET = withLogger(
  withAuth("GET /api/users/[id]", async (request: NextRequest, { params }: Ctx) => getById(request, (await params).id)),
);
export const PUT = withLogger(
  withAuth("PUT /api/users/[id]", async (request: NextRequest, { params }: Ctx) => replace(request, (await params).id), owners.userParam),
);
export const PATCH = withLogger(
  withAuth("PATCH /api/users/[id]", async (request: NextRequest, { params }: Ctx) => update(request, (await params).id), owners.userParam),
);
export const DELETE = withLogger(
  withAuth(
    "DELETE /api/users/[id]",
    async (request: NextRequest, { params }: Ctx, user) => remove(request, (await params).id, viewerOf(user)),
    owners.userParam,
  ),
);
