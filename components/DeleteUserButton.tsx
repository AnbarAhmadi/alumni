"use client";

type Props = {
  action: () => Promise<void>; // delete server action with the id already bound
  name: string; // shown in the confirmation
  label?: string; // the button's word, "Delete" unless given (Week 10: "Withdraw")
};

// A one-button form that asks for confirmation before running the delete action.
export default function DeleteUserButton({ action, name, label = "Delete" }: Props) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(`${label} ${name}? This can't be undone.`)) event.preventDefault();
      }}
    >
      <button type="submit" className="button danger">{label}</button>
    </form>
  );
}
