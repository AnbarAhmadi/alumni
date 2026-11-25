"use client";

import { useActionState, useId } from "react";
import type { JobPosting } from "@/models/JobPosting";
import type { UserFormState } from "./UserForm";
import { friendlyError } from "./friendlyError";

// Same { error, field, values } shape as the other forms.
export type JobPostingFormState = UserFormState;

type Props = {
  action: (state: JobPostingFormState, formData: FormData) => Promise<JobPostingFormState>;
  owners: { id: number; fullName: string }[]; // the owner dropdown
  posting?: JobPosting; // pre-fills the form when editing
  submitLabel: string;
};

const TEXT_FIELDS = [
  { name: "title", label: "Title", required: true, multiline: false, hint: "At most 120 characters." },
  { name: "company", label: "Company", required: true, multiline: false, hint: undefined },
  { name: "city", label: "City (optional)", required: false, multiline: false, hint: undefined },
  { name: "description", label: "Description (optional)", required: false, multiline: true, hint: undefined },
] as const;

const ERROR_LABELS = { userId: "Owner", title: "Title", company: "Company", city: "City", description: "Description" };

// The job posting form of the admin panel (Week 10): the owner (a user), title, company,
// city and description. Labels above the fields, each error under its field.
export default function JobPostingForm({ action, owners, posting, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const formId = useId();
  const error = state.error && friendlyError(state.error, ERROR_LABELS);

  const invalid = (name: string) => state.field === name;
  const errorText = (name: string) =>
    invalid(name) && (
      <p id={`${formId}-${name}-error`} className="form-error" role="alert">
        {error}
      </p>
    );
  const aria = (name: string) => ({
    "aria-invalid": invalid(name) || undefined,
    "aria-describedby": invalid(name) ? `${formId}-${name}-error` : undefined,
  });

  return (
    <form action={formAction} className="form">
      <div className={invalid("userId") ? "field invalid" : "field"}>
        <label htmlFor={`${formId}-userId`}>Owner</label>
        <select
          id={`${formId}-userId`}
          name="userId"
          className="select"
          defaultValue={state.values?.userId ?? (posting ? String(posting.userId) : "")}
          required
          {...aria("userId")}
        >
          {!posting && <option value="">Choose a user</option>}
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>{owner.fullName}</option>
          ))}
        </select>
        {errorText("userId")}
      </div>

      {TEXT_FIELDS.map((field) => {
        const inputId = `${formId}-${field.name}`;
        const common = {
          id: inputId,
          name: field.name,
          defaultValue: state.values?.[field.name] ?? posting?.[field.name] ?? "",
          required: field.required && !posting,
          ...aria(field.name),
        };
        return (
          <div key={field.name} className={invalid(field.name) ? "field invalid" : "field"}>
            <label htmlFor={inputId}>{field.label}</label>
            {field.hint && <p className="field-hint">{field.hint}</p>}
            {field.multiline ? <textarea {...common} rows={5} /> : <input {...common} type="text" />}
            {errorText(field.name)}
          </div>
        );
      })}

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
