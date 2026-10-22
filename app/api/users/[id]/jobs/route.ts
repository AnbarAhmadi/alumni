import type { NextRequest } from "next/server";
import { create, getAll } from "@/controllers/ApiUserJobController";

type Ctx = RouteContext<"/api/users/[id]/jobs">;

export const GET = async (request: NextRequest, { params }: Ctx) => getAll(request, (await params).id);
export const POST = async (request: NextRequest, { params }: Ctx) => create(request, (await params).id);
