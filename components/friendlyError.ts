// Turns a validation message from the models into plain words for the website forms.
// The models (and so the JSON API) keep their exact messages, for example
//   "fullName" is required.            ->  Full name is required.
//   "title" must be a non-empty string. ->  Title can't be empty.
//   "email" must be a valid email address. -> Email must be a valid email address.
//   Send at least one of: fullName, email, age, school.  ->  Change at least one field.
// `labels` maps each field name to the label the form shows.
export function friendlyError(message: string, labels: Record<string, string>): string {
  if (message.startsWith("Send at least one of:")) return "Change at least one field.";

  const match = message.match(/^"(\w+)" (.*)$/);
  if (!match) return message;

  const [, field, rest] = match;
  const label = labels[field] ?? field;
  if (rest === "must be a non-empty string.") return `${label} can't be empty.`;
  return `${label} ${rest}`;
}
