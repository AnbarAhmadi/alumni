import { create, getAll } from "@/controllers/ApiUserController";

export const GET = (request: Request) => getAll(request);
export const POST = (request: Request) => create(request);
