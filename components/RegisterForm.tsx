"use client";

import { useActionState, useId, useState } from "react";
import { friendlyError } from "./friendlyError";

// What the register action returns when it doesn't redirect.
export type RegisterFormState = {
  errors?: Record<string, string>; // the model's message for each invalid field
  error?: string; // an error that isn't about one field
  values?: Record<string, string>; // what was typed, without the passwords
};

type Props = {
  action: (state: RegisterFormState, formData: FormData) => Promise<RegisterFormState>;
};

// The names used in error messages ("Full name is required."); the API keeps its own messages.
const ERROR_LABELS = {
  fullName: "Full name",
  email: "Email",
  password: "Password",
  confirmPassword: "Confirm password",
  role: "Role",
  graduationYear: "Graduation year",
  school: "School",
};

// Plain words for the website (BRAND.md Voice); the JSON API keeps the model's messages.
function plainError(field: string, message: string) {
  if (field === "email" && message.includes("already used")) return "An account with this email already exists.";
  if (field === "confirmPassword" && message.includes("must match")) return "The passwords don't match.";
  if (field === "role") return "Choose Alumni or Student.";
  return friendlyError(message, ERROR_LABELS);
}

const FIRST_GRADUATION_YEAR = 1950;

// The register form. Each label is above its field and each error right under it
// (globals.css: .field, .form-error). Graduation year is shown only when Alumni is chosen.
// noValidate: the server checks every rule and answers in plain words under each field.
export default function RegisterForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [role, setRole] = useState(state.values?.role ?? "");
  const formId = useId();
  const currentYear = new Date().getFullYear();

  const errorOf = (name: string) => {
    const message = state.errors?.[name];
    return message ? plainError(name, message) : undefined;
  };

  // The ids and ARIA attributes that tie a field to its error.
  const describe = (name: string) => {
    const invalid = state.errors?.[name] !== undefined;
    const errorId = `${formId}-${name}-error`;
    return {
      invalid,
      errorId,
      inputProps: { "aria-invalid": invalid || undefined, "aria-describedby": invalid ? errorId : undefined },
    };
  };

  const errorText = (name: string) => {
    const message = errorOf(name);
    return message ? (
      <p id={`${formId}-${name}-error`} className="form-error" role="alert">
        {message}
      </p>
    ) : null;
  };

  const textField = (name: string, label: string, type: string, autoComplete: string, keep = true, hint?: string) => {
    const { invalid, inputProps } = describe(name);
    const inputId = `${formId}-${name}`;
    const hintId = `${inputId}-hint`;
    return (
      <div className={invalid ? "field invalid" : "field"}>
        <label htmlFor={inputId}>{label}</label>
        {hint && (
          <p id={hintId} className="field-hint">
            {hint}
          </p>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          autoComplete={autoComplete}
          defaultValue={keep ? state.values?.[name] : undefined}
          {...inputProps}
          aria-describedby={[hint && hintId, inputProps["aria-describedby"]].filter(Boolean).join(" ") || undefined}
        />
        {errorText(name)}
      </div>
    );
  };

  const roleError = describe("role");
  const yearField = describe("graduationYear");

  return (
    <form action={formAction} className="form" noValidate>
      {textField("fullName", "Full name", "text", "name")}
      {textField("email", "Email", "email", "email")}
      {textField("password", "Password", "password", "new-password", false, "At least 8 characters.")}
      {textField("confirmPassword", "Confirm password", "password", "new-password", false)}

      <fieldset
        className={roleError.invalid ? "field choice-group invalid" : "field choice-group"}
        aria-describedby={roleError.invalid ? roleError.errorId : undefined}
      >
        <legend>I am</legend>
        {[
          { value: "ALUMNI", label: "Alumni: I graduated" },
          { value: "STUDENT", label: "Student: I study here now" },
        ].map((option) => (
          <label key={option.value} className="choice">
            <input
              type="radio"
              name="role"
              value={option.value}
              checked={role === option.value}
              onChange={() => setRole(option.value)}
            />
            {option.label}
          </label>
        ))}
        {errorText("role")}
      </fieldset>

      {role === "ALUMNI" && (
        <div className={yearField.invalid ? "field invalid" : "field"}>
          <label htmlFor={`${formId}-graduationYear`}>Graduation year</label>
          <input
            id={`${formId}-graduationYear`}
            name="graduationYear"
            type="number"
            inputMode="numeric"
            min={FIRST_GRADUATION_YEAR}
            max={currentYear}
            step={1}
            defaultValue={state.values?.graduationYear}
            {...yearField.inputProps}
          />
          {errorText("graduationYear")}
        </div>
      )}

      {textField("school", "School (optional)", "text", "organization")}

      {state.error && (
        <p className="form-error" role="alert">
          {friendlyError(state.error, ERROR_LABELS)}
        </p>
      )}

      <button type="submit" className="button primary" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
