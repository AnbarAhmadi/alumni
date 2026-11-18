"use client";

import { useActionState, useId } from "react";
import type { User } from "@/models/User";
import { friendlyError } from "./friendlyError";

// What a create/edit server action returns when it doesn't redirect.
export type UserFormState = {
  error?: string;
  field?: string;
  values?: Record<string, string>; // what was typed, so it isn't lost on an error
};

type Props = {
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
  user?: User; // pre-fills the form when editing
  submitLabel: string;
};

const FIELDS = [
  { name: "fullName", label: "Full name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "age", label: "Age", type: "number", required: true },
  { name: "school", label: "School (optional)", type: "text", required: false },
] as const;

// The names used in error messages ("Full name is required."); the API keeps "fullName".
const ERROR_LABELS = { fullName: "Full name", email: "Email", age: "Age", school: "School" };

// Create and edit form. Each label is above its field, and an error is shown right
// under the field it is about (styles in globals.css: .field, .form-error).
export default function UserForm({ action, user, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const formId = useId();
  const error = state.error && friendlyError(state.error, ERROR_LABELS);

  const valueOf = (name: (typeof FIELDS)[number]["name"]) =>
    state.values?.[name] ?? (user?.[name] !== undefined ? String(user[name]) : "");

  return (
    <form action={formAction} className="form">
      {FIELDS.map((field) => {
        const invalid = state.field === field.name;
        const inputId = `${formId}-${field.name}`;
        const errorId = `${inputId}-error`;
        return (
          <div key={field.name} className={invalid ? "field invalid" : "field"}>
            <label htmlFor={inputId}>{field.label}</label>
            <input
              id={inputId}
              name={field.name}
              type={field.type}
              defaultValue={valueOf(field.name)}
              required={field.required && !user}
              min={field.type === "number" ? 1 : undefined}
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
      })}

      {/* Errors that aren't about one field, e.g. "Send at least one of: ..." */}
      {error && !state.field && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="button primary" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
