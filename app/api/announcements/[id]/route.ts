import type { NextRequest } from "next/server";
import { getById, remove, replace, update } from "@/controllers/ApiAnnouncementController";
import { withLogger } from "@/lib/withLogger";

type Ctx = RouteContext<"/api/announcements/[id]">;

export const GET = withLogger(async (request: NextRequest, { params }: Ctx) => getById(request, (await params).id));
export const PUT = withLogger(async (request: NextRequest, { params }: Ctx) => replace(request, (await params).id));
export const PATCH = withLogger(async (request: NextRequest, { params }: Ctx) => update(request, (await params).id));
export const DELETE = withLogger(async (request: NextRequest, { params }: Ctx) => remove(request, (await params).id));
