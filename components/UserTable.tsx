import Link from "next/link";
import type { User } from "@/models/User";
import DeleteUserButton from "./DeleteUserButton";

type Props = {
  users: User[];
  highlightId?: number; // a just-created user, shown with a notice
  // Server action that deletes the user with the given id.
  deleteAction: (id: number) => Promise<void>;
};

export default function UserTable({ users, highlightId, deleteAction }: Props) {
  if (users.length === 0) {
    return <p className="empty">No users yet. Add one with the form below.</p>;
  }

  const created = users.find((u) => u.id === highlightId);

  return (
    <>
      {created && (
        <p className="notice" role="status">
          Added {created.fullName}.
        </p>
      )}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full name</th>
              <th>Email</th>
              <th>Age</th>
              <th>School</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={user.id === highlightId ? "highlight" : undefined}>
                <td>{user.id}</td>
                <td>
                  <Link href={`/users/${user.id}`}>{user.fullName}</Link>
                </td>
                <td>{user.email}</td>
                <td>{user.age}</td>
                <td>{user.school ?? "—"}</td>
                <td className="actions">
                  <Link href={`/users/${user.id}`} className="button">View</Link>
                  <Link href={`/users/${user.id}/edit`} className="button">Edit</Link>
                  <DeleteUserButton action={deleteAction.bind(null, user.id)} name={user.fullName} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
