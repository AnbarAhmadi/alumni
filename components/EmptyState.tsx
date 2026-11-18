import Link from "next/link";

type Props = {
  message: string; // one plain sentence, in the BRAND.md voice
  action?: { href: string; label: string }; // at most one action (DESIGN.md rule 7)
};

// The one empty state of the website (DESIGN.md rule 7, ref-3): a dashed frame
// where the list would be, one sentence, and an optional button.
export default function EmptyState({ message, action }: Props) {
  return (
    <div className="empty">
      <p>{message}</p>
      {action && (
        <Link href={action.href} className="button primary">
          {action.label}
        </Link>
      )}
    </div>
  );
}
