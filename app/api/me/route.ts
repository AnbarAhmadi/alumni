import { me } from "@/controllers/ApiAuthController";
import { withAuth } from "@/lib/guard";
import { withLogger } from "@/lib/withLogger";

// GET /api/me (Week 10): the logged-in user; withAuth answers 401 without a valid session.
export const GET = withLogger(withAuth("GET /api/me", (_request: Request, _ctx, user) => me(user!)));
