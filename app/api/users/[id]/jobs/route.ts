import type { NextRequest } from "next/server";
import { create, getAll } from "@/controllers/ApiUserJobController";
import { withLogger } from "@/lib/withLogger";

type Ctx = RouteContext<"/api/users/[id]/jobs">;

export const GET = withLogger(async (request: NextRequest, { params }: Ctx) => getAll(request, (await params).id));
export const POST = withLogger(async (request: NextRequest, { params }: Ctx) => create(request, (await params).id));
