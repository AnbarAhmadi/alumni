import type { NextRequest } from "next/server";
import { getById, remove, replace, update } from "@/controllers/ApiAnnouncementController";
import { withAuth } from "@/lib/guard";
import { withLogger } from "@/lib/withLogger";

type Ctx = RouteContext<"/api/announcements/[id]">;

// Access rules: lib/access.ts. Everyone reads an announcement; an admin changes or deletes it.
export const GET = withLogger(async (request: NextRequest, { params }: Ctx) => getById(request, (await params).id));
export const PUT = withLogger(
  withAuth("PUT /api/announcements/[id]", async (request: NextRequest, { params }: Ctx) => replace(request, (await params).id)),
);
export const PATCH = withLogger(
  withAuth("PATCH /api/announcements/[id]", async (request: NextRequest, { params }: Ctx) => update(request, (await params).id)),
);
export const DELETE = withLogger(
  withAuth("DELETE /api/announcements/[id]", async (request: NextRequest, { params }: Ctx) => remove(request, (await params).id)),
);
