import { create, getAll } from "@/controllers/ApiUserController";
import { withAuth } from "@/lib/guard";
import { withLogger } from "@/lib/withLogger";

// Access rules: lib/access.ts (ddd.md, Access rules).
export const GET = withLogger(withAuth("GET /api/users", (request: Request) => getAll(request)));
export const POST = withLogger(withAuth("POST /api/users", (request: Request) => create(request)));
