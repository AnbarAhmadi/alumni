"use client";

import { useActionState } from "react";
import type { User } from "@/models/User";

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

export default function UserForm({ action, user, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  const valueOf = (name: (typeof FIELDS)[number]["name"]) =>
    state.values?.[name] ?? (user?.[name] !== undefined ? String(user[name]) : "");

  return (
    <form action={formAction} className="form">
      {FIELDS.map((field) => {
        const invalid = state.field === field.name;
        return (
          <label key={field.name} className={invalid ? "field invalid" : "field"}>
            <span>{field.label}</span>
            <input
              name={field.name}
              type={field.type}
              defaultValue={valueOf(field.name)}
              required={field.required && !user}
              min={field.type === "number" ? 1 : undefined}
              aria-invalid={invalid || undefined}
            />
            {invalid && (
              <span className="form-error" role="alert">
                {state.error}
              </span>
            )}
          </label>
        );
      })}

      {/* Errors that aren't about one field, e.g. "Send at least one of: ..." */}
      {state.error && !state.field && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" className="button primary" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
