import type { NextRequest } from "next/server";
import { getForUser } from "@/controllers/ApiApplicationController";

type Ctx = RouteContext<"/api/users/[id]/applications">;

export const GET = async (request: NextRequest, { params }: Ctx) => getForUser(request, (await params).id);
