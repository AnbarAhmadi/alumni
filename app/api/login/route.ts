import { login } from "@/controllers/ApiAuthController";
import { withLogger } from "@/lib/withLogger";

// POST /api/login (Week 10): email and password; sets the session cookie.
export const POST = withLogger((request: Request) => login(request));
