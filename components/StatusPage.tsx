// The shared look of the 403, 404 and 500 pages: a large serif status code, one plain
// line and the actions. It never shows an error message, a digest or a stack trace.
type Props = {
  code: "403" | "404" | "500";
  line: string;
  children: React.ReactNode; // the buttons and links
};

export default function StatusPage({ code, line, children }: Props) {
  return (
    <section className="status-page" aria-labelledby="status-title">
      <h1 id="status-title" className="status-code">
        <span className="visually-hidden">Error </span>
        {code}
      </h1>
      <p className="status-line">{line}</p>
      <div className="button-row">{children}</div>
    </section>
  );
}
