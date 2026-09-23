import type { NextRequest } from "next/server";

const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;

function text(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/sum/[number1]/[number2]">,
) {
  const { number1, number2 } = await ctx.params;

  if (!NUMBER_PATTERN.test(number1) || !NUMBER_PATTERN.test(number2)) {
    return text(`Error: "${number1}" and "${number2}" must both be numbers.`, 400);
  }

  return text(String(Number(number1) + Number(number2)));
}
