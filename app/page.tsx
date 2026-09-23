import Link from "next/link";

const categories = [
  {
    id: "about",
    icon: "🎓",
    title: "About",
    text: "Learn what the Alumni Tracking System is and why we built it.",
    href: "/about",
  },
  {
    id: "alumni",
    icon: "📇",
    title: "Alumni Directory",
    text: "Search graduates by year, program, company or city.",
  },
  {
    id: "profile",
    icon: "👤",
    title: "My Profile",
    text: "Keep your contact details and career information up to date.",
  },
  {
    id: "mentorship",
    icon: "🤝",
    title: "Mentorship",
    text: "Connect current students with experienced graduates.",
  },
  {
    id: "events",
    icon: "📅",
    title: "Events & Reunions",
    text: "Meetups, reunions and department events for alumni.",
  },
  {
    id: "careers",
    icon: "💼",
    title: "Careers & Jobs",
    text: "Job and internship posts shared by alumni and partners.",
  },
  {
    id: "news",
    icon: "📰",
    title: "News & Success Stories",
    text: "Achievements and updates from our graduates.",
  },
  {
    id: "contact",
    icon: "✉️",
    title: "Contact",
    text: "Get in touch with the MIS department alumni office.",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Alumni Tracking System</h1>
        <p className="subtitle">
          Management Information Systems · Istanbul University
        </p>
        <p>
          Keeping Istanbul University connected to its graduates through one
          place for alumni records, networking and mentorship.
        </p>
      </section>

      <main className="container">
        <h2 className="section-title">Explore</h2>
        <div className="grid">
          {categories.map((c) =>
            c.href ? (
              <Link key={c.id} id={c.id} href={c.href} className="card card-link">
                <div className="icon">{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <span className="badge live">Open →</span>
              </Link>
            ) : (
              <div key={c.id} id={c.id} className="card">
                <div className="icon">{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <span className="badge">Coming soon</span>
              </div>
            ),
          )}
        </div>
      </main>
    </>
  );
}
