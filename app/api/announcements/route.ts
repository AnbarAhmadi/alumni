import { create, getAll } from "@/controllers/ApiAnnouncementController";
import { withAuth } from "@/lib/guard";
import { withLogger } from "@/lib/withLogger";

// Access rules: lib/access.ts. Everyone reads announcements; an admin writes them.
export const GET = withLogger(() => getAll());
export const POST = withLogger(withAuth("POST /api/announcements", (request: Request) => create(request)));
