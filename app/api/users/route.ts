type User = {
  id: string;
  name: string;
  email: string;
};

// In-memory store: resets whenever the server restarts.
const users: User[] = [];

export function GET() {
  return Response.json(users);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const { name, email } = (body ?? {}) as Record<string, unknown>;

  if (typeof name !== "string" || name.trim() === "") {
    return Response.json({ error: '"name" is required.' }, { status: 400 });
  }
  if (typeof email !== "string" || email.trim() === "") {
    return Response.json({ error: '"email" is required.' }, { status: 400 });
  }

  const user: User = { id: crypto.randomUUID(), name: name.trim(), email: email.trim() };
  users.push(user);

  return Response.json(user, { status: 201 });
}
