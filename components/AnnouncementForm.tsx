"use client";

import { useActionState } from "react";
import type { Announcement } from "@/models/Announcement";
import type { UserFormState } from "./UserForm";

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

// globals.css only styles `.field input`, so the content box copies that look here.
const textareaStyle = (invalid: boolean) => ({
  padding: "0.55rem 0.7rem",
  border: `1px solid ${invalid ? "#b42318" : "var(--border)"}`,
  borderRadius: 6,
  font: "inherit",
  fontWeight: 400,
  resize: "vertical" as const,
});

export default function AnnouncementForm({ action, announcement, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  const valueOf = (name: (typeof FIELDS)[number]["name"]) =>
    state.values?.[name] ?? announcement?.[name] ?? "";

  return (
    <form action={formAction} className="form">
      {FIELDS.map((field) => {
        const invalid = state.field === field.name;
        const common = {
          name: field.name,
          defaultValue: valueOf(field.name),
          required: field.required && !announcement,
          "aria-invalid": invalid || undefined,
        };
        return (
          <label key={field.name} className={invalid ? "field invalid" : "field"}>
            <span>{field.label}</span>
            {field.multiline ? (
              <textarea {...common} rows={5} style={textareaStyle(invalid)} />
            ) : (
              <input {...common} type="text" />
            )}
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
