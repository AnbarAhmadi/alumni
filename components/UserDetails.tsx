import type { User } from "@/models/User";

// One user shown as key/value pairs.
export default function UserDetails({ user }: { user: User }) {
  const rows: [string, string | number][] = [
    ["ID", user.id],
    ["Full name", user.fullName],
    ["Email", user.email],
    ["Age", user.age],
    ["School", user.school ?? "—"],
  ];

  return (
    <dl className="details">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
