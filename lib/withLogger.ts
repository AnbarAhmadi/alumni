// Request logger and 5xx guard for the API routes. Next.js has no app.use(), and
// proxy.ts runs before the route, so it can't see the final status code. Instead
// every route handler is wrapped: export const GET = withLogger(handler).
//
// It writes one line per request, for example:
//   10:20:30 POST /api/users 201 18 ms
// Request bodies are never logged.
//
// Known errors (400, 404, 409, 415) are answered by the controllers and pass
// through unchanged. Anything a handler throws is unexpected: the full error and
// stack trace go to the terminal and to logs/error.log, and the client gets a
// plain 500 with no internal details: { "error": "Internal server error" }.
// The server keeps running, even if the log file can't be written.
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { inspect } from "node:util";

const LOG_DIR = path.join(process.cwd(), "logs");
const ERROR_LOG = path.join(LOG_DIR, "error.log");

function time() {
  return new Date().toTimeString().slice(0, 8); // HH:MM:SS, local time
}

function route(request: Request) {
  return new URL(request.url).pathname;
}

function log(request: Request, status: number, start: number) {
  const ms = Math.round(performance.now() - start);
  console.log(`${time()} ${request.method} ${route(request)} ${status} ${ms} ms`);
}

// Appends one entry to logs/error.log, creating logs/ if needed: timestamp,
// method, route, message and stack trace. A failure here is only reported in
// the terminal; it never reaches the client or stops the server.
async function writeErrorLog(request: Request, err: unknown, details: string) {
  const message = err instanceof Error ? err.message.trim() : String(err);
  const entry =
    `=== ${new Date().toISOString()} ${request.method} ${route(request)}\n` +
    `Message: ${message}\n` +
    `Stack:\n${details}\n\n`;
  try {
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(ERROR_LOG, entry, "utf8");
  } catch (writeErr) {
    console.error(`${time()} could not write ${ERROR_LOG}: ${writeErr instanceof Error ? writeErr.message : writeErr}`);
  }
}

function internalServerError() {
  return Response.json({ error: "Internal server error" }, { status: 500 });
}

export function withLogger<R extends Request, A extends unknown[]>(
  handler: (request: R, ...rest: A) => Response | Promise<Response>,
) {
  return async (request: R, ...rest: A): Promise<Response> => {
    const start = performance.now();
    let response: Response;
    try {
      response = await handler(request, ...rest);
    } catch (err) {
      // One string with the stack, the error's own fields (code, meta) and its cause,
      // so the terminal, Next's dev log file (.next/dev/logs) and logs/error.log all show all of it.
      const details = inspect(err, { depth: 5 });
      console.error(`${time()} ${request.method} ${route(request)} unexpected error:\n${details}`);
      await writeErrorLog(request, err, details);
      response = internalServerError();
    }
    log(request, response.status, start);
    return response;
  };
}
