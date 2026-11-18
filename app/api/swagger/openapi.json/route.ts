import { openApiSpec } from "../openapi";
import { withLogger } from "@/lib/withLogger";

export const GET = withLogger(() => {
  return Response.json(openApiSpec);
});
