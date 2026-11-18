import type { NextRequest } from "next/server";
import { getForUser } from "@/controllers/ApiApplicationController";
import { withLogger } from "@/lib/withLogger";

type Ctx = RouteContext<"/api/users/[id]/applications">;

export const GET = withLogger(async (request: NextRequest, { params }: Ctx) => getForUser(request, (await params).id));
