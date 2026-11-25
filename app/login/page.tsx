import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import { safeNext } from "@/lib/access";
import { loginAction } from "./actions";

export const metadata: Metadata = {
  title: "Log in | Homecoming",
};

// GET /login (Week 10): the login form. It posts back to this page (loginAction); a
// successful login goes to ?next= when it is a safe relative path, else to the home page.
// Rules: ddd.md, Login and sessions, and Access rules.
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = safeNext((await searchParams).next) ?? undefined;

  return (
    <div className="stack reading">
      <section aria-labelledby="login-title">
        <h1 id="login-title">Log in</h1>
        <p className="meta">
          {next ? "Log in to see that page." : "Use the email and password of your Homecoming account."}
        </p>
        <div className="card">
          <LoginForm action={loginAction} next={next} />
        </div>
        <p className="page-back">
          No account yet? <Link href="/register" className="text-link">Register</Link>
        </p>
      </section>
    </div>
  );
}
