import Link from "next/link";

type Props = {
  userId?: number; // adds links to this user's details and edit pages
};

// Links between the user pages: list, new, details and edit.
export default function UserNav({ userId }: Props) {
  return (
    <nav className="user-nav" aria-label="User pages">
      <Link href="/users">← All users</Link>
      {userId !== undefined && <Link href={`/users/${userId}`}>Details</Link>}
      {userId !== undefined && <Link href={`/users/${userId}/edit`}>Edit</Link>}
      <Link href="/users#new-user">+ New user</Link>
    </nav>
  );
}
