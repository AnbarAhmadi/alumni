"use client";

type Props = {
  action: () => Promise<void>; // delete server action with the id already bound
  name: string; // shown in the confirmation
};

// A one-button form that asks for confirmation before running the delete action.
export default function DeleteUserButton({ action, name }: Props) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(`Delete ${name}? This can't be undone.`)) event.preventDefault();
      }}
    >
      <button type="submit" className="button danger">Delete</button>
    </form>
  );
}
