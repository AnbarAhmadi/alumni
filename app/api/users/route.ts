import { create, getAll } from "@/controllers/ApiUserController";
import { withLogger } from "@/lib/withLogger";

export const GET = withLogger((request: Request) => getAll(request));
export const POST = withLogger((request: Request) => create(request));
