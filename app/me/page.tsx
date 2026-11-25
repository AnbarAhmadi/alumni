import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import * as MeController from "@/controllers/MeController";
import { ProfileForm, PasswordForm } from "@/components/MeForms";
import UserDetails from "@/components/UserDetails";
import { guardPage } from "@/lib/guard";
import { ROLE_LABELS } from "@/lib/navigation";
import { changeMyPasswordAction, updateMyProfileAction } from "./actions";

export const metadata: Metadata = {
  title: "My profile | Homecoming",
};

// GET /me (Week 10): the logged-in user's own profile, an edit form for their details and
// a Change password form. Logged in; always the SESSION user (no id in the URL).
export default async function MePage() {
  await connection();
  const viewer = (await guardPage("page /me", "/me"))!;
  const user = (await MeController.profile(viewer.id))!;

  return (
    <div className="stack reading">
      <section aria-labelledby="profile-title">
        <UserDetails user={user} roleLabel={ROLE_LABELS[user.role]} />
        <p>
          <Link href="/me/applications" className="text-link">My applications</Link>
        </p>
      </section>

      <section aria-labelledby="me-details-title">
        <h2 id="me-details-title" className="section-title">Edit my details</h2>
        <p className="meta">Your email and role can&apos;t be changed here.</p>
        <ProfileForm action={updateMyProfileAction} user={user} />
      </section>

      <section aria-labelledby="me-password-title">
        <h2 id="me-password-title" className="section-title">Change password</h2>
        <p className="meta">You stay logged in here; your other devices are logged out.</p>
        <PasswordForm action={changeMyPasswordAction} />
      </section>
    </div>
  );
}
