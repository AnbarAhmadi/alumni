import Link from "next/link";
import type { UserAccount } from "@/models/User";
import DeleteUserButton from "./DeleteUserButton";
import EmptyState from "./EmptyState";

type Props = {
  users: UserAccount[];
  currentUserId: number; // the admin looking at the page: their row is marked "(you)"
  changeRoleAction: (id: number, formData: FormData) => Promise<void>;
  deleteAction: (id: number) => Promise<void>;
};

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "ALUMNI", label: "Alumni" },
  { value: "STUDENT", label: "Student" },
];

// The users table of /admin/users (DESIGN.md ref-2, the same .table as /users): name,
// email, role (a dropdown with Save), alumni badge, graduation year, Edit and Delete.
export default function AdminUserTable({ users, currentUserId, changeRoleAction, deleteAction }: Props) {
  if (users.length === 0) return <EmptyState message="No users yet." />;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Alumni</th>
            <th scope="col">Graduation year</th>
            <th scope="col"><span className="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const selectId = `role-${user.id}`;
            return (
              <tr key={user.id}>
                <td>
                  <Link href={`/users/${user.id}`} className="table-name">{user.fullName}</Link>
                  {user.id === currentUserId && <span className="muted"> (you)</span>}
                </td>
                <td>{user.email}</td>
                <td>
                  <form action={changeRoleAction.bind(null, user.id)} className="inline-form">
                    <label htmlFor={selectId} className="visually-hidden">Role of {user.fullName}</label>
                    <select id={selectId} name="role" defaultValue={user.role} className="select">
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <button type="submit" className="button">
                      Save<span className="visually-hidden"> the role of {user.fullName}</span>
                    </button>
                  </form>
                </td>
                <td>{user.isAlumni ? <span className="badge">Alumni</span> : <span className="muted">—</span>}</td>
                <td>{user.graduationYear ?? <span className="muted">—</span>}</td>
                <td className="actions">
                  <Link href={`/users/${user.id}/edit`} className="button">
                    Edit<span className="visually-hidden"> {user.fullName}</span>
                  </Link>
                  <DeleteUserButton action={deleteAction.bind(null, user.id)} name={user.fullName} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
