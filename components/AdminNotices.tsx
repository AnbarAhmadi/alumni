// The result line at the top of an admin page (Week 10): what a form just did, or why it
// was refused (in --color-danger). The pages pass plain sentences.
type Props = {
  done?: string;
  blocked?: string;
};

export default function AdminNotices({ done, blocked }: Props) {
  return (
    <>
      {done && (
        <p className="notice" role="status">
          {done}
        </p>
      )}
      {blocked && (
        <p className="notice notice-blocked" role="alert">
          {blocked}
        </p>
      )}
    </>
  );
}
