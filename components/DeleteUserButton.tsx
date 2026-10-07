// A one-button form that calls a delete server action (with the id already bound).
export default function DeleteUserButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <button type="submit" className="button danger">Delete</button>
    </form>
  );
}
