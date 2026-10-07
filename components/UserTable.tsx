import Link from "next/link";
import type { User } from "@/models/User";
import DeleteUserButton from "./DeleteUserButton";

type Props = {
  users: User[];
  // Server action that deletes the user with the given id.
  deleteAction: (id: number) => Promise<void>;
};

export default function UserTable({ users, deleteAction }: Props) {
  if (users.length === 0) {
    return <p className="muted">No users yet. Add one with the form below.</p>;
  }

  return (
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
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                <Link href={`/users/${user.id}`}>{user.fullName}</Link>
              </td>
              <td>{user.email}</td>
              <td>{user.age}</td>
              <td>{user.school ?? "—"}</td>
              <td className="actions">
                <Link href={`/users/${user.id}`} className="button">View</Link>
                <DeleteUserButton action={deleteAction.bind(null, user.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
