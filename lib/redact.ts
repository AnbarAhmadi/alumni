// Keeps password hashes out of logs (Week 10). Prisma's error messages print the
// arguments of the failed query, so an unexpected error while saving a user would
// otherwise show the passwordHash in the terminal and in logs/error.log.

// A bcrypt hash: $2a$, $2b$, $2x$ or $2y$, the cost, then 53 characters of salt and hash.
const BCRYPT_HASH = /\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}/g;

export function redactSecrets(text: string): string {
  return text.replace(BCRYPT_HASH, "[redacted]");
}

// Removes hashes from an error's message and stack in place, so whoever logs it
// later (withLogger, or Next.js for a server action) never sees them.
export function scrubError(err: unknown): void {
  if (!(err instanceof Error)) return;
  err.message = redactSecrets(err.message);
  if (err.stack) err.stack = redactSecrets(err.stack);
}
