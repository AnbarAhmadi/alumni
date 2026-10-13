import type { NextRequest } from "next/server";
import { getById, remove, replace, update } from "@/controllers/ApiAnnouncementController";

type Ctx = RouteContext<"/api/announcements/[id]">;

export const GET = async (request: NextRequest, { params }: Ctx) => getById(request, (await params).id);
export const PUT = async (request: NextRequest, { params }: Ctx) => replace(request, (await params).id);
export const PATCH = async (request: NextRequest, { params }: Ctx) => update(request, (await params).id);
export const DELETE = async (request: NextRequest, { params }: Ctx) => remove(request, (await params).id);
