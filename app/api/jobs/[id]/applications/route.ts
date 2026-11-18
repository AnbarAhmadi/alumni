import type { NextRequest } from "next/server";
import { createForJob, getForJob } from "@/controllers/ApiApplicationController";
import { withLogger } from "@/lib/withLogger";

type Ctx = RouteContext<"/api/jobs/[id]/applications">;

export const GET = withLogger(async (request: NextRequest, { params }: Ctx) => getForJob(request, (await params).id));
export const POST = withLogger(async (request: NextRequest, { params }: Ctx) => createForJob(request, (await params).id));
