import type { UserWithStatus } from "@/models/User";

// "Şelale Öztürk" -> "ŞÖ": the first letter of the first and the last name,
// uppercased with Turkish rules (i -> İ).
function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return letters.map((part) => part.charAt(0).toLocaleUpperCase("tr-TR")).join("");
}

// The profile header: initials avatar, the name in large serif, and the user's details.
// roleLabel (Week 10, /me): shown as the badge instead of "Alumni".
export default function UserDetails({ user, roleLabel }: { user: UserWithStatus; roleLabel?: string }) {
  return (
    <div className="profile">
      <div className="profile-head">
        <span className="avatar" aria-hidden="true">{initials(user.fullName)}</span>
        <div>
          <h1 id="profile-title">{user.fullName}</h1>
          {roleLabel ? <span className="badge">{roleLabel}</span> : user.isAlumni && <span className="badge">Alumni</span>}
        </div>
      </div>
      <dl className="facts">
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>School</dt>
          <dd>{user.school ?? "—"}</dd>
        </div>
        <div>
          <dt>Graduation year</dt>
          <dd>{user.graduationYear ?? "—"}</dd>
        </div>
      </dl>
    </div>
  );
}
