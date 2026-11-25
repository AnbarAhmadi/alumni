import { register } from "@/controllers/ApiUserController";
import { withLogger } from "@/lib/withLogger";

// POST /api/register (Week 10): create an account with the register rules of ddd.md.
export const POST = withLogger((request: Request) => register(request));
