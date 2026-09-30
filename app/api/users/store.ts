export type User = {
  id: number;
  fullName: string;
  email: string;
  school: string;
  age: number;
};

// In-memory store: resets whenever the server restarts.
// Kept on globalThis so every route file sees the same data, even when
// Next.js bundles routes separately or reloads a file in dev.
const globalStore = globalThis as typeof globalThis & {
  userStore?: { users: User[]; nextId: number };
};

const store = (globalStore.userStore ??= { users: [], nextId: 1 });

export const users = store.users;

export function nextUserId() {
  return store.nextId++;
}
