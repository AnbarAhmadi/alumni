import { create, getAll } from "@/controllers/ApiAnnouncementController";
import { withLogger } from "@/lib/withLogger";

export const GET = withLogger(() => getAll());
export const POST = withLogger((request: Request) => create(request));
