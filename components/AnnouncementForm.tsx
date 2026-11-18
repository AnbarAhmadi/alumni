"use client";

import { useActionState, useId } from "react";
import type { Announcement } from "@/models/Announcement";
import type { UserFormState } from "./UserForm";
import { friendlyError } from "./friendlyError";

// Same { error, field, values } shape as the user form.
export type AnnouncementFormState = UserFormState;

type Props = {
  action: (state: AnnouncementFormState, formData: FormData) => Promise<AnnouncementFormState>;
  announcement?: Announcement; // pre-fills the form when editing
  submitLabel: string;
};

const FIELDS = [
  { name: "title", label: "Title", required: true, multiline: false },
  { name: "content", label: "Content", required: true, multiline: true },
  { name: "author", label: "Author (optional)", required: false, multiline: false },
] as const;

// The names used in error messages ("Title is required."); the API keeps its own messages.
const ERROR_LABELS = { title: "Title", content: "Content", author: "Author" };

// Create and edit form. Each label is above its field, and an error is shown right
// under the field it is about (styles in globals.css: .field, .form-error).
export default function AnnouncementForm({ action, announcement, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const formId = useId();
  const error = state.error && friendlyError(state.error, ERROR_LABELS);

  const valueOf = (name: (typeof FIELDS)[number]["name"]) =>
    state.values?.[name] ?? announcement?.[name] ?? "";

  return (
    <form action={formAction} className="form">
      {FIELDS.map((field) => {
        const invalid = state.field === field.name;
        const inputId = `${formId}-${field.name}`;
        const errorId = `${inputId}-error`;
        const common = {
          id: inputId,
          name: field.name,
          defaultValue: valueOf(field.name),
          required: field.required && !announcement,
          "aria-invalid": invalid || undefined,
          "aria-describedby": invalid ? errorId : undefined,
        };
        return (
          <div key={field.name} className={invalid ? "field invalid" : "field"}>
            <label htmlFor={inputId}>{field.label}</label>
            {field.multiline ? <textarea {...common} rows={8} /> : <input {...common} type="text" />}
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
