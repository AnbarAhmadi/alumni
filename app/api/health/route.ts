import { withLogger } from "@/lib/withLogger";

export const GET = withLogger(() => {
  return Response.json({ status: "ok" });
});
