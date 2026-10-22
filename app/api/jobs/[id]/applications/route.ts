import type { NextRequest } from "next/server";
import { createForJob, getForJob } from "@/controllers/ApiApplicationController";

type Ctx = RouteContext<"/api/jobs/[id]/applications">;

export const GET = async (request: NextRequest, { params }: Ctx) => getForJob(request, (await params).id);
export const POST = async (request: NextRequest, { params }: Ctx) => createForJob(request, (await params).id);
