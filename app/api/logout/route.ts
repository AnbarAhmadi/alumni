import { logout } from "@/controllers/ApiAuthController";
import { withLogger } from "@/lib/withLogger";

// POST /api/logout (Week 10): deletes the session and clears the cookie.
export const POST = withLogger(() => logout());
