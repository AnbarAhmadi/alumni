import type { Metadata } from "next";
import RegisterForm from "@/components/RegisterForm";
import { registerAction } from "./actions";

export const metadata: Metadata = {
  title: "Register | Homecoming",
};

// GET /register (Week 10): the register form. It posts back to this page (registerAction),
// and a new account goes to its own page, /users/:id. Rules: ddd.md, Register rules.
export default function RegisterPage() {
  return (
    <div className="stack reading">
      <section aria-labelledby="register-title">
        <h1 id="register-title">Create an account</h1>
        <p className="meta">For graduates and current students of the department.</p>
        <div className="card">
          <RegisterForm action={registerAction} />
        </div>
      </section>
    </div>
  );
}
