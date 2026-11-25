"use client";

import { useActionState, useId } from "react";
import { friendlyError } from "./friendlyError";

// What the login action returns when it doesn't redirect.
export type LoginFormState = {
  error?: string;
  field?: string; // set only when a field is missing
  email?: string; // kept on an error; the password never is
};

type Props = {
  action: (state: LoginFormState, formData: FormData) => Promise<LoginFormState>;
  next?: string; // where to go after login (already checked by safeNext); sent as a hidden field
};

const ERROR_LABELS = { email: "Email", password: "Password" };

// The login form: email and password. A missing field is named under that field; a wrong
// email or password gives one generic message under the form, so it never says which.
// noValidate: the server checks the fields and answers in plain words.
export default function LoginForm({ action, next }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const formId = useId();
  const error = state.error && friendlyError(state.error, ERROR_LABELS);

  const field = (name: "email" | "password", label: string, type: string, autoComplete: string) => {
    const inputId = `${formId}-${name}`;
    const errorId = `${inputId}-error`;
    const invalid = state.field === name;
    return (
      <div className={invalid ? "field invalid" : "field"}>
        <label htmlFor={inputId}>{label}</label>
        <input
          id={inputId}
          name={name}
          type={type}
          autoComplete={autoComplete}
          defaultValue={name === "email" ? state.email : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
        />
        {invalid && (
          <p id={errorId} className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <form action={formAction} className="form" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {field("email", "Email", "email", "email")}
      {field("password", "Password", "password", "current-password")}

      {error && !state.field && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="button primary" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
