import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/hello/[name]">,
) {
  const { name } = await ctx.params;
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  return new Response(`Hello, ${capitalized}!`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
