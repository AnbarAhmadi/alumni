"use client";

import { useActionState, useId } from "react";
import { friendlyError } from "./friendlyError";

// What the /me actions return (Week 10).
export type MeFormState = {
  errors?: Record<string, string>; // the model's message for each invalid field
  values?: Record<string, string>; // what was typed (never a password)
  done?: string; // the success line
};

type Action = (state: MeFormState, formData: FormData) => Promise<MeFormState>;

const ERROR_LABELS = {
  fullName: "Full name",
  graduationYear: "Graduation year",
  school: "School",
  currentPassword: "Current password",
  newPassword: "New password",
  confirmPassword: "Confirm new password",
};

// Plain words for the website (BRAND.md Voice).
function plainError(field: string, message: string) {
  if (field === "currentPassword" && message.endsWith("is wrong.")) return "Your current password is wrong.";
  if (field === "confirmPassword") return "The new passwords don't match.";
  if (field === "graduationYear" && message.includes("not allowed")) return "Only graduates have a graduation year.";
  return friendlyError(message, ERROR_LABELS);
}

type FieldProps = {
  state: MeFormState;
  formId: string;
  name: string;
  label: string;
  type?: string;
  autoComplete: string;
  defaultValue?: string;
  hint?: string;
  inputMode?: "numeric";
};

// One labelled field with its error right under it (globals.css: .field, .form-error).
function Field({ state, formId, name, label, type = "text", autoComplete, defaultValue, hint, inputMode }: FieldProps) {
  const id = `${formId}-${name}`;
  const message = state.errors?.[name];
  const describedBy = [hint && `${id}-hint`, message && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={message ? "field invalid" : "field"}>
      <label htmlFor={id}>{label}</label>
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={message ? true : undefined}
        aria-describedby={describedBy}
      />
      {message && (
        <p id={`${id}-error`} className="form-error" role="alert">
          {plainError(name, message)}
        </p>
      )}
    </div>
  );
}

function Done({ state }: { state: MeFormState }) {
  return state.done && !state.errors ? <p className="notice" role="status">{state.done}</p> : null;
}

type ProfileProps = {
  action: Action;
  user: { fullName: string; school?: string; graduationYear?: number; isAlumni: boolean };
};

// Edit my details: full name, school, and graduation year for graduates. Email and role
// are not editable here. Keeps what was typed on an error.
export function ProfileForm({ action, user }: ProfileProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const formId = useId();
  const value = (name: string, saved?: string | number) => state.values?.[name] ?? (saved === undefined ? "" : String(saved));
  return (
    <form action={formAction} className="form" noValidate>
      <Done state={state} />
      <Field state={state} formId={formId} name="fullName" label="Full name" autoComplete="name" defaultValue={value("fullName", user.fullName)} />
      <Field state={state} formId={formId} name="school" label="School (optional)" autoComplete="organization" defaultValue={value("school", user.school)} hint="Leave it empty to remove it." />
      {user.isAlumni && (
        <Field state={state} formId={formId} name="graduationYear" label="Graduation year" autoComplete="off" inputMode="numeric" defaultValue={value("graduationYear", user.graduationYear)} />
      )}
      <button type="submit" className="button primary" disabled={pending}>
        {pending ? "Saving…" : "Save my details"}
      </button>
    </form>
  );
}

// Change password: current, new (8+), confirm. The fields are always empty after a submit.
export function PasswordForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, {});
  const formId = useId();
  return (
    <form action={formAction} className="form" noValidate key={state.done}>
      <Done state={state} />
      <Field state={state} formId={formId} name="currentPassword" label="Current password" type="password" autoComplete="current-password" />
      <Field state={state} formId={formId} name="newPassword" label="New password" type="password" autoComplete="new-password" hint="At least 8 characters." />
      <Field state={state} formId={formId} name="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" />
      <button type="submit" className="button primary" disabled={pending}>
        {pending ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}
