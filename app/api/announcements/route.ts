import { create, getAll } from "@/controllers/ApiAnnouncementController";

export const GET = () => getAll();
export const POST = (request: Request) => create(request);
