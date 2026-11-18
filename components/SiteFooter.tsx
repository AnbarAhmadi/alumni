// The site footer. Used by app/layout.tsx and by app/global-error.tsx.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="column">
        © {new Date().getFullYear()} Management Information Systems, Istanbul University
      </div>
    </footer>
  );
}
