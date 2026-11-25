// For /me and /me/applications (Week 10): the logged-in user's own profile, password and
// applications. Every function takes the SESSION user's id from the caller (the guard),
// never an id from the URL or the form. Returns { ok, errors } for the forms.
import { ApplicationModel, type ApplicationWithJobPosting } from "@/models/Application";
import { RegistrationError, UserModel, type FieldError, type UserAccount } from "@/models/User";
import { endOtherSessions } from "@/lib/session";

export type MeResult = { ok: boolean; errors?: FieldError[] };

function text(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

export async function profile(userId: number): Promise<UserAccount | null> {
  return UserModel.getAccount(userId);
}

// The edit form: full name, school (empty clears it) and graduation year (graduates only).
export async function updateProfile(userId: number, formData: FormData): Promise<MeResult> {
  const year = text(formData, "graduationYear")?.trim();
  const input = {
    fullName: text(formData, "fullName"),
    school: text(formData, "school") ?? "",
    ...(year !== undefined && year !== "" && { graduationYear: /^\d+$/.test(year) ? Number(year) : year }),
  };
  try {
    await UserModel.updateOwnProfile(userId, input);
    return { ok: true };
  } catch (err) {
    if (err instanceof RegistrationError) return { ok: false, errors: err.errors };
    throw err;
  }
}

// The Change password form. On success the user's OTHER sessions are deleted; this one stays.
export async function changePassword(userId: number, formData: FormData): Promise<MeResult> {
  const input = {
    currentPassword: text(formData, "currentPassword"),
    newPassword: text(formData, "newPassword"),
    confirmPassword: text(formData, "confirmPassword"),
  };
  try {
    await UserModel.changePassword(userId, input);
  } catch (err) {
    if (err instanceof RegistrationError) return { ok: false, errors: err.errors };
    throw err;
  }
  await endOtherSessions(userId);
  return { ok: true };
}

export async function applications(userId: number): Promise<ApplicationWithJobPosting[]> {
  return ApplicationModel.getAllByUser(userId);
}

// Withdraw: deletes the application only if it is the user's own.
export async function withdraw(userId: number, applicationId: number): Promise<boolean> {
  return ApplicationModel.removeOwn(applicationId, userId);
}
