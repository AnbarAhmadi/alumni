import DeleteUserButton from "./DeleteUserButton";

type Props = {
  action: () => Promise<void>; // delete server action with the id already bound
  title: string; // shown in the confirmation
};

// The user delete button already works for any record: it confirms with the
// given name and then runs the action. Here the name is the announcement title.
export default function DeleteAnnouncementButton({ action, title }: Props) {
  return <DeleteUserButton action={action} name={`"${title}"`} />;
}
