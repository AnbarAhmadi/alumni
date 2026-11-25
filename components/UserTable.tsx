import Link from "next/link";
import type { UserWithStatus } from "@/models/User";
import { can, type Viewer } from "@/lib/access";
import DeleteUserButton from "./DeleteUserButton";
import EmptyState from "./EmptyState";

type Props = {
  users: UserWithStatus[];
  highlightId?: number; // a just-created user, shown with a notice
  // Server action that deletes the user with the given id.
  deleteAction: (id: number) => Promise<void>;
  viewer: Viewer; // who is looking: Edit and Delete show only on rows they may change
};

// The users as a table (DESIGN.md ref-2): name (a link to the profile), email, school,
// alumni badge and graduation year, with Edit and Delete at the end of the rows the viewer
// may change (their own row, or every row for an admin). Hiding is only looks: the guard checks.
export default function UserTable({ users, highlightId, deleteAction, viewer }: Props) {
  if (users.length === 0) {
    return can("form createUser", viewer) ? (
      <EmptyState message="No users yet. Add the first one." action={{ href: "#new-user", label: "Add a user" }} />
    ) : (
      <EmptyState message="No users yet." />
    );
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
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">School</th>
              <th scope="col">Alumni</th>
              <th scope="col">Graduation year</th>
              <th scope="col"><span className="visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={user.id === highlightId ? "highlight" : undefined}>
                <td>
                  <Link href={`/users/${user.id}`} className="table-name">{user.fullName}</Link>
                </td>
                <td>{user.email}</td>
                <td>{user.school ?? <span className="muted">—</span>}</td>
                <td>{user.isAlumni ? <span className="badge">Alumni</span> : <span className="muted">—</span>}</td>
                <td>{user.graduationYear ?? <span className="muted">—</span>}</td>
                <td className="actions">
                  {can("page /users/[id]/edit", viewer, user.id) && (
                    <Link href={`/users/${user.id}/edit`} className="button">
                      Edit<span className="visually-hidden"> {user.fullName}</span>
                    </Link>
                  )}
                  {can("form deleteUser", viewer, user.id) && (
                    <DeleteUserButton action={deleteAction.bind(null, user.id)} name={user.fullName} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
