// Web controller for reading the /users list and the /users/[id] profile with the
// alumni status (isAlumni, graduationYear). Read-only: creating, editing and deleting
// still go through UserController and the server actions. All data access goes through UserModel.
import { UserModel, type UserProfile, type UserWithStatus } from "@/models/User";
import type { Result } from "./UserController";

function toId(id: string | number) {
  return typeof id === "number" ? id : /^\d+$/.test(id) ? Number(id) : NaN;
}

export async function index(): Promise<Result<UserWithStatus[]>> {
  return { ok: true, data: await UserModel.getAllWithStatus() };
}

export async function profile(id: string | number): Promise<Result<UserProfile>> {
  const user = await UserModel.getProfile(toId(id));
  if (!user) return { ok: false, error: `User "${id}" not found.` };
  return { ok: true, data: user };
}
