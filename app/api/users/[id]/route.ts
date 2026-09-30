import type { NextRequest } from "next/server";
import { users } from "../store";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/users/[id]">,
) {
  const { id } = await ctx.params;
  const user = users.find((u) => String(u.id) === id);

  if (!user) {
    return Response.json({ error: `User "${id}" not found.` }, { status: 404 });
  }

  return Response.json(user);
}
