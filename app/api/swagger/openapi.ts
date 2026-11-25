import { ACCESS_RULES, NOT_LOGGED_IN, type AccessKey, type Rule } from "@/lib/access";

// OpenAPI description of every route in the app (API routes, the /users pages and the /announcements pages).
// Keep this in sync when routes change.

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema: object, example?: unknown) => ({
  "application/json": example === undefined ? { schema } : { schema, example },
});
const text = (example: string) => ({ "text/plain": { schema: { type: "string", example } } });
const html = { "text/html": { schema: { type: "string" } } };

// The same body accepted as JSON, multipart/form-data or x-www-form-urlencoded.
// Form values are text; "age" is converted to a number by the server.
const writeBody = (schema: string, example: object) => ({
  required: true,
  content: {
    "application/json": { schema: ref(schema), example },
    "multipart/form-data": { schema: ref(schema), example },
    "application/x-www-form-urlencoded": { schema: ref(schema), example },
  },
});

const errorResponse = (description: string, examples: Record<string, [string, string?]>) => ({
  description,
  content: {
    "application/json": {
      schema: ref("Error"),
      examples: Object.fromEntries(
        Object.entries(examples).map(([name, [error, field]]) => [
          name,
          { value: field ? { error, field } : { error } },
        ]),
      ),
    },
  },
});

// Every 404 of the JSON API has the same shape: { "error": "Not found", "reason": "..." } (lib/notFound.ts).
const notFoundResponse = (description: string, examples: Record<string, string>) => ({
  description,
  content: {
    "application/json": {
      schema: ref("NotFound"),
      examples: Object.fromEntries(
        Object.entries(examples).map(([name, reason]) => [name, { value: { error: "Not found", reason } }]),
      ),
    },
  },
});

const exampleUser = {
  id: 1,
  fullName: "Ayşe Yılmaz",
  email: "ayse.yilmaz@example.com",
  age: 24,
  school: "Istanbul University",
};

const exampleJobPosting = {
  id: 26,
  userId: 1,
  title: "Junior Data Analyst",
  company: "Example Analytics",
  city: "Istanbul",
  description: "Two days a week in the office. SQL and Excel are a plus.",
  createdAt: "2026-10-22T09:00:00.000Z",
};

const jobIdParam = {
  name: "id",
  in: "path",
  required: true,
  description: "The job posting's id.",
  schema: { type: "integer", minimum: 1, example: 1 },
};

const exampleApplication = { id: 31, userId: 15, jobPostingId: 1, status: "applied", createdAt: "2026-10-22T10:00:00.000Z" };

const jobNotFound = notFoundResponse("No job posting has this id, or (POST) no user has the userId in the body.", {
  jobNotFound: "Job posting 9999 does not exist",
  userNotFound: "User 9999 does not exist",
});

const userIdParam = {
  name: "id",
  in: "path",
  required: true,
  description: "The user's id.",
  schema: { type: "integer", minimum: 1, example: 1 },
};

const notFound = notFoundResponse("No user has this id.", {
  notFound: "User 9999 does not exist",
});

const unsupportedType = errorResponse("The Content-Type is not JSON or form data.", {
  unsupported: [
    'Unsupported Content-Type "text/plain". Use application/json, multipart/form-data or application/x-www-form-urlencoded.',
  ],
});

// 409: the email is already used. The database's unique index decides; emails are stored in lowercase.
const emailConflict = errorResponse("Another user already has this email (compared in lowercase).", {
  duplicateEmail: ['"email" is already used by another user.', "email"],
});

const validationErrors = {
  missingField: ['"email" is required.', "email"] as [string, string],
  invalidEmail: ['"email" must be a valid email address.', "email"] as [string, string],
  invalidAge: ['"age" must be a positive whole number.', "age"] as [string, string],
  invalidJson: ["Request body must be valid JSON."] as [string],
};

const exampleAnnouncement = {
  id: 1,
  title: "Welcome to Homecoming",
  content: "The MIS department now has one place to stay in touch with its graduates. Please keep your details up to date.",
  author: "MIS Department",
  createdAt: "2026-09-22T09:00:00.000Z",
};

const announcementIdParam = {
  name: "id",
  in: "path",
  required: true,
  description: "The announcement's id.",
  schema: { type: "integer", minimum: 1, example: 1 },
};

const announcementNotFound = notFoundResponse("No announcement has this id.", {
  notFound: "Announcement 9999 does not exist",
});

const announcementValidationErrors = {
  missingTitle: ['"title" is required.', "title"] as [string, string],
  missingContent: ['"content" is required.', "content"] as [string, string],
  emptyTitle: ['"title" must be a non-empty string.', "title"] as [string, string],
  invalidJson: ["Request body must be valid JSON."] as [string],
};

// Every /api handler is wrapped with withLogger (lib/withLogger.ts), which turns any
// unexpected error into 500 { "error": "Internal server error" }. Instead of repeating
// that in each operation, this adds the shared 500 response to every /api operation.
const METHODS = ["get", "put", "post", "patch", "delete"] as const;
function withServerErrors<T extends Record<string, Record<string, unknown>>>(paths: T): T {
  for (const [path, item] of Object.entries(paths)) {
    if (!path.startsWith("/api/")) continue;
    for (const method of METHODS) {
      const operation = item[method] as { responses?: Record<string, unknown> } | undefined;
      if (operation?.responses) operation.responses[500] = { $ref: "#/components/responses/InternalServerError" };
    }
  }
  return paths;
}

// Every HTML page shows the 500 page when something fails on the server (app/error.tsx):
// "Something went wrong on our side." with Try again; never the error itself.
const pageError = {
  description: "Something failed on the server (for example the database is down): the 500 page is shown, with no error details.",
  content: html,
};

function withPageErrors<T extends Record<string, Record<string, unknown>>>(paths: T): T {
  for (const item of Object.values(paths)) {
    for (const method of METHODS) {
      const operation = item[method] as { tags?: string[]; responses?: Record<string, unknown> } | undefined;
      if (operation?.responses && operation.tags?.some((tag) => tag.endsWith("(views)"))) operation.responses[500] = pageError;
    }
  }
  return paths;
}

// Week 10: the access rule of every /api operation comes from lib/access.ts (the one rules map),
// so the spec can't drift from what the guard does. Each guarded operation gets the session
// cookie as its security, a line saying who may use it, and the 401 (and 403) answers.
const ACCESS_TEXT: Record<Rule, string> = {
  public: "Access: public.",
  loggedIn: "Access: logged in.",
  ownerOrAdmin: "Access: the owner of the record, or an admin.",
  admin: "Access: admin only.",
};

const notLoggedIn = errorResponse("No valid session (not logged in, or the session has expired).", {
  notLoggedIn: [NOT_LOGGED_IN],
});

const forbiddenResponse = (reason: string) => ({
  description: "Logged in, but this account may not do this.",
  content: json(ref("Forbidden"), { error: "Forbidden", reason }),
});

function withAccess<T extends Record<string, Record<string, unknown>>>(paths: T): T {
  for (const [path, item] of Object.entries(paths)) {
    if (!path.startsWith("/api/")) continue;
    for (const method of METHODS) {
      const operation = item[method] as
        | { description?: string; security?: unknown; responses?: Record<string, unknown> }
        | undefined;
      if (!operation?.responses) continue;
      const key = `${method.toUpperCase()} ${path.replace(/\{(\w+)\}/g, "[$1]")}` as AccessKey;
      const rule: Rule | undefined = ACCESS_RULES[key];
      if (!rule) continue;
      operation.description = [ACCESS_TEXT[rule], operation.description].filter(Boolean).join(" ");
      if (rule === "public") continue;
      operation.security = [{ sessionCookie: [] }];
      operation.responses[401] = notLoggedIn;
      if (rule === "admin") operation.responses[403] = forbiddenResponse("Only an admin can do this.");
      if (rule === "ownerOrAdmin") {
        operation.responses[403] = forbiddenResponse("Only the owner of this record or an admin can do this.");
      }
    }
  }
  return paths;
}

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Homecoming API",
    version: "1.0.0",
    description:
      "Users and announcements are stored in PostgreSQL (through Prisma), so they are kept when the server restarts. " +
      "For development, `npx prisma db seed` fills the database with 20 fake users and 5 fake announcements.\n\n" +
      "Write requests (POST, PUT, PATCH) accept `application/json`, `multipart/form-data` or `application/x-www-form-urlencoded`. " +
      "Any `id` in the body is ignored: ids are generated on create and taken from the URL otherwise. " +
      "An announcement's `createdAt` is always set by the server.\n\n" +
      "Every 404 of the JSON API has the same body: `{ \"error\": \"Not found\", \"reason\": \"...\" }`. " +
      "The reason says what was missing (`User 9999 does not exist`). Unknown paths under `/api` answer this 404 for any method, " +
      "for example `GET /api/banana` gives `{ \"error\": \"Not found\", \"reason\": \"No route GET /api/banana\" }`.\n\n" +
      "Any unexpected error (for example the database is down) answers `500` with `{ \"error\": \"Internal server error\" }` and no other details; " +
      "the full error and stack trace are printed only in the server's terminal and appended to `logs/error.log`.",
  },
  tags: [
    { name: "Users", description: "JSON API for users: create, read, update and delete." },
    {
      name: "Register",
      description:
        "Create an account with a password and a role (ALUMNI or STUDENT; ADMIN can't be chosen). " +
        "Only a bcrypt hash of the password is stored, and it is never returned by any endpoint.",
    },
    {
      name: "Login",
      description:
        "Log in, log out and the current user. A session lasts 7 days and lives in the httpOnly cookie homecoming_session; " +
        "the database keeps only the SHA-256 hash of its token. In Swagger, Try it out uses the browser's own cookie, " +
        "so log in first and /api/me then works. Seeded users log in with their email and the demo-only password homecoming-demo.",
    },
    { name: "Job postings", description: "A user's job postings (nested under /api/users/{id}). The user always comes from the URL." },
    { name: "Applications", description: "Users apply to job postings (many-to-many through applications). A user can apply to a posting only once." },
    {
      name: "Users (views)",
      description:
        "HTML pages for users. Reading: page -> UserDirectoryController -> UserModel -> view components; the edit page and the forms: UserController. " +
        "The POST operations are the pages' forms: Next.js server actions that post back to the page URL with an internal action id the page provides. " +
        "They are documented for completeness and can't be sent from Swagger's Try it out; use the Users JSON API for programmatic access.",
    },
    { name: "Announcements", description: "JSON API for announcements: create, read, update and delete." },
    {
      name: "Announcements (views)",
      description:
        "HTML pages for announcements (page -> AnnouncementController -> AnnouncementModel -> view components). " +
        "Like the user pages, the POST operations are server actions: documented here, but they can't be sent from Try it out. " +
        "Use the Announcements JSON API for programmatic access. " +
        "Like every HTML page, these pages show the 404 page for an unknown id and the 500 page when something fails on the server.",
    },
    {
      name: "Admin (views)",
      description: "The admin panel (Week 10): HTML pages for admins only. Documented here; use the Users JSON API for programmatic access.",
    },
    { name: "Health", description: "Check that the API is running." },
    { name: "Examples", description: "Simple plain-text example routes." },
  ],
  paths: withServerErrors(withAccess(withPageErrors({
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List all users",
        responses: {
          200: {
            description: "Every stored user.",
            content: json({ type: "array", items: ref("User") }, [exampleUser]),
          },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create a user",
        description: "fullName, email and age are required; school is optional. Emails are stored in lowercase and must be unique: a duplicate gives 409.",
        requestBody: writeBody("UserCreate", {
          fullName: "Ayşe Yılmaz",
          email: "ayse.yilmaz@example.com",
          age: 24,
          school: "Istanbul University",
        }),
        responses: {
          201: { description: "The created user.", content: json(ref("User"), exampleUser) },
          400: errorResponse("The body can't be read, or a field is missing or invalid.", validationErrors),
          409: emailConflict,
          415: unsupportedType,
        },
      },
    },
    "/api/login": {
      post: {
        tags: ["Login"],
        summary: "Log in",
        description:
          "email and password are required. An unknown email and a wrong password give the same 401 with the same message, " +
          "so the answer never tells whether an account exists. On success the response sets the session cookie (7 days).",
        requestBody: writeBody("LoginRequest", { email: "ayse.yilmaz@example.com", password: "homecoming-demo" }),
        responses: {
          200: {
            description: "Logged in: the user (never the password or its hash), and a Set-Cookie header with homecoming_session (HttpOnly, SameSite=Lax, Path=/, Max-Age 7 days; Secure in production).",
            headers: {
              "Set-Cookie": { schema: { type: "string", example: "homecoming_session=<token>; Path=/; Max-Age=604800; HttpOnly; SameSite=lax" } },
            },
            content: json(ref("UserAccount"), {
              id: 1, fullName: "Ayşe Yılmaz", email: "ayse.yilmaz@example.com", age: 24,
              school: "Istanbul University", isAlumni: true, graduationYear: 2023, role: "ADMIN",
            }),
          },
          400: errorResponse("The body can't be read, or email or password is missing.", {
            missingEmail: ['"email" is required.', "email"],
            missingPassword: ['"password" is required.', "password"],
          }),
          401: errorResponse("Unknown email or wrong password: always the same message.", {
            wrong: ["Email or password is wrong."],
          }),
          415: unsupportedType,
        },
      },
    },
    "/api/logout": {
      post: {
        tags: ["Login"],
        summary: "Log out",
        description: "Deletes the session of the cookie and clears the cookie. Also 204 when not logged in.",
        security: [{ sessionCookie: [] }],
        responses: {
          204: {
            description: "Logged out. No body; the cookie is cleared (Max-Age=0).",
            headers: { "Set-Cookie": { schema: { type: "string", example: "homecoming_session=; Path=/; Max-Age=0; HttpOnly; SameSite=lax" } } },
          },
        },
      },
    },
    "/api/me": {
      get: {
        tags: ["Login"],
        summary: "The logged-in user",
        description: "The user of the session cookie. Without a cookie, or with an unknown or expired session, 401 (an expired session is deleted).",
        security: [{ sessionCookie: [] }],
        responses: {
          200: {
            description: "The logged-in user (never the password or its hash).",
            content: json(ref("UserAccount"), {
              id: 1, fullName: "Ayşe Yılmaz", email: "ayse.yilmaz@example.com", age: 24,
              school: "Istanbul University", isAlumni: true, graduationYear: 2023, role: "ADMIN",
            }),
          },
          401: errorResponse("No valid session.", { notLoggedIn: ["Not logged in."] }),
        },
      },
    },
    "/api/register": {
      post: {
        tags: ["Register"],
        summary: "Register a new account",
        description:
          "fullName, email, password (at least 8 characters), confirmPassword (the same as password) and role (ALUMNI or STUDENT) are required. " +
          "graduationYear is required for ALUMNI (a whole number from 1950 to the current year) and not allowed for STUDENT; school is optional. " +
          "ALUMNI accounts get isAlumni: true. Emails are stored in lowercase and must be unique: a duplicate gives 409. " +
          "If several fields are invalid, the 400 names the first one. The response never contains the password or its hash.",
        requestBody: writeBody("RegisterRequest", {
          fullName: "Ayşe Yılmaz",
          email: "ayse.yilmaz@example.com",
          password: "a-long-password",
          confirmPassword: "a-long-password",
          role: "ALUMNI",
          graduationYear: 2023,
          school: "Istanbul University",
        }),
        responses: {
          201: {
            description: "The new account, without any password or hash.",
            content: json(ref("UserAccount"), {
              id: 21,
              fullName: "Ayşe Yılmaz",
              email: "ayse.yilmaz@example.com",
              school: "Istanbul University",
              isAlumni: true,
              graduationYear: 2023,
              role: "ALUMNI",
            }),
          },
          400: errorResponse("The body can't be read, or a field is missing or invalid (the first invalid field).", {
            missingField: ['"fullName" is required.', "fullName"],
            shortPassword: ['"password" must be at least 8 characters.', "password"],
            passwordMismatch: ['"confirmPassword" must match "password".', "confirmPassword"],
            invalidRole: ['"role" must be ALUMNI or STUDENT.', "role"],
            missingYear: ['"graduationYear" is required for alumni.', "graduationYear"],
            yearForStudent: ['"graduationYear" is not allowed for students.', "graduationYear"],
          }),
          409: emailConflict,
          415: unsupportedType,
        },
      },
    },
    "/api/users/{id}": {
      parameters: [userIdParam],
      get: {
        tags: ["Users"],
        summary: "Get one user, with their job postings",
        description: "The user and their job postings (oldest first) in a jobs array, loaded together. A user without postings gets jobs: [].",
        responses: {
          200: {
            description: "The user, with a jobs array.",
            content: json(ref("UserWithJobs"), { ...exampleUser, jobs: [{ ...exampleJobPosting, id: 1 }] }),
          },
          404: notFound,
        },
      },
      put: {
        tags: ["Users"],
        summary: "Replace a user",
        description: "Every field is required, including school.",
        requestBody: writeBody("UserReplace", {
          fullName: "Ayşe Yılmaz",
          email: "ayse@example.com",
          age: 25,
          school: "Boğaziçi University",
        }),
        responses: {
          200: {
            description: "The updated user.",
            content: json(ref("User"), { ...exampleUser, email: "ayse@example.com", age: 25, school: "Boğaziçi University" }),
          },
          400: errorResponse("The body can't be read, or a field is missing or invalid.", {
            ...validationErrors,
            missingField: ['"school" is required.', "school"],
          }),
          404: notFound,
          409: emailConflict,
          415: unsupportedType,
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update some fields of a user",
        description: "Only the fields sent are changed. At least one field is required.",
        requestBody: writeBody("UserPatch", { age: 25 }),
        responses: {
          200: { description: "The updated user.", content: json(ref("User"), { ...exampleUser, age: 25 }) },
          400: errorResponse("The body can't be read, no field was sent, or a field is invalid.", {
            noFields: ["Send at least one of: fullName, email, age, school."],
            invalidAge: validationErrors.invalidAge,
          }),
          404: notFound,
          409: emailConflict,
          415: unsupportedType,
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete a user",
        description:
          "Safety rules (Week 10): an admin can't delete their own account, and the last admin can't be deleted (409).",
        responses: {
          204: { description: "The user was deleted. The response has no body." },
          404: notFound,
          409: errorResponse("A safety rule refuses the delete.", {
            selfDelete: ["You can't delete your own admin account."],
            lastAdmin: ["The last admin can't be deleted."],
          }),
        },
      },
    },
    "/api/users/{id}/role": {
      parameters: [userIdParam],
      patch: {
        tags: ["Users"],
        summary: "Change a user's role",
        description:
          "Week 10, used by the admin panel (/admin/users). role is ADMIN, ALUMNI or STUDENT. isAlumni is not changed: " +
          "it says whether the person graduated, not what they may do. Safety rule: the last admin can't be demoted (409).",
        requestBody: writeBody("UserRole", { role: "ADMIN" }),
        responses: {
          200: {
            description: "The user with the new role (never a password or its hash).",
            content: json(ref("UserAccount"), { ...exampleUser, isAlumni: true, graduationYear: 2023, role: "ADMIN" }),
          },
          400: errorResponse("The body can't be read, or role is missing or not one of the three.", {
            missingRole: ['"role" is required.', "role"],
            invalidRole: ['"role" must be ADMIN, ALUMNI or STUDENT.', "role"],
          }),
          404: notFound,
          409: errorResponse("A safety rule refuses the change.", {
            lastAdmin: ["The last admin can't be demoted. Make another user an admin first."],
          }),
          415: unsupportedType,
        },
      },
    },
    "/api/users/{id}/jobs": {
      parameters: [userIdParam],
      get: {
        tags: ["Job postings"],
        summary: "List a user's job postings",
        description: "The postings of the user in the URL, oldest first. An empty list if the user has none.",
        responses: {
          200: { description: "The user's job postings.", content: json({ type: "array", items: ref("JobPosting") }, [exampleJobPosting]) },
          404: notFound,
        },
      },
      post: {
        tags: ["Job postings"],
        summary: "Create a job posting for a user",
        description:
          "title (at most 120 characters) and company are required; city and description are optional. " +
          "The user comes from the URL: a userId in the body is ignored. id and createdAt are set by the database.",
        requestBody: writeBody("JobPostingCreate", {
          title: "Junior Data Analyst",
          company: "Example Analytics",
          city: "Istanbul",
          description: "Two days a week in the office. SQL and Excel are a plus.",
        }),
        responses: {
          201: { description: "The created job posting, with the userId from the URL.", content: json(ref("JobPosting"), exampleJobPosting) },
          400: errorResponse("The body can't be read, or a field is missing or invalid.", {
            missingTitle: ['"title" is required.', "title"],
            titleTooLong: ['"title" must be at most 120 characters.', "title"],
            missingCompany: ['"company" is required.', "company"],
            emptyCity: ['"city" must be a non-empty string.', "city"],
            invalidJson: ["Request body must be valid JSON."],
          }),
          404: notFound,
          415: unsupportedType,
        },
      },
    },
    "/api/jobs/{id}/applications": {
      parameters: [jobIdParam],
      get: {
        tags: ["Applications"],
        summary: "List the applicants of a job posting",
        description: "The applications to the posting in the URL, oldest first, each with the applicant's id and name.",
        responses: {
          200: {
            description: "The applications, with the applicant's name.",
            content: json({ type: "array", items: ref("ApplicationWithUser") }, [
              { ...exampleApplication, user: { id: 15, fullName: "Salim Denkel" } },
            ]),
          },
          404: notFoundResponse("No job posting has this id.", { jobNotFound: "Job posting 9999 does not exist" }),
        },
      },
      post: {
        tags: ["Applications"],
        summary: "Apply to a job posting",
        description:
          "Send no body: nothing in it is used (Week 10). The applicant is always the logged-in user, the posting " +
          "comes from the URL, and the status is always applied; a userId, jobPostingId or status in a body is ignored. " +
          "Only the posting's owner or an admin can change the status afterwards (PATCH /api/applications/{id}). " +
          "A second application by the same user to the same posting is refused by the database's unique pair (userId, jobPostingId): 409.",
        responses: {
          201: {
            description: "The created application, with the logged-in user's id as userId and status applied.",
            content: json(ref("Application"), exampleApplication),
          },
          404: jobNotFound,
          409: errorResponse("This user has already applied to this job posting.", {
            duplicate: ["This user has already applied to this job posting.", "jobPostingId"],
          }),
        },
      },
    },
    "/api/applications/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, description: "The application's id.", schema: { type: "integer", minimum: 1, example: 31 } },
      ],
      patch: {
        tags: ["Applications"],
        summary: "Change an application's status",
        description:
          "Only status can be changed; a userId or jobPostingId in the body is ignored. Allowed for the owner of the " +
          "posting the application is for, or an admin; never for the applicant (Week 10). " +
          "status must be one of applied, reviewed, hired or rejected (ddd.md); anything else gives 400.",
        requestBody: writeBody("ApplicationStatus", { status: "reviewed" }),
        responses: {
          200: { description: "The updated application.", content: json(ref("Application"), { ...exampleApplication, status: "reviewed" }) },
          400: errorResponse("The body can't be read, or status is missing or not one of the four.", {
            missingStatus: ['"status" is required.', "status"],
            unknownStatus: ['"status" must be one of: applied, reviewed, hired, rejected.', "status"],
          }),
          404: notFoundResponse("No application has this id.", { applicationNotFound: "Application 9999 does not exist" }),
          415: unsupportedType,
        },
      },
      delete: {
        tags: ["Applications"],
        summary: "Delete an application",
        description: "Week 10, used by the admin panel (/admin/applications).",
        responses: {
          204: { description: "The application was deleted. The response has no body." },
          404: notFoundResponse("No application has this id.", { applicationNotFound: "Application 9999 does not exist" }),
        },
      },
    },
    "/api/jobs/{id}": {
      parameters: [jobIdParam],
      patch: {
        tags: ["Job postings"],
        summary: "Edit a job posting",
        description:
          "Week 10, used by the admin panel (/admin/jobs). Only the fields sent change: title (at most 120 characters), company, " +
          "city, description, and userId to give the posting another owner (an existing user).",
        requestBody: writeBody("JobPostingUpdate", { title: "Senior Data Analyst", userId: 3 }),
        responses: {
          200: { description: "The updated job posting.", content: json(ref("JobPosting"), { ...exampleJobPosting, title: "Senior Data Analyst", userId: 3 }) },
          400: errorResponse("The body can't be read, no field was sent, or a field is invalid.", {
            longTitle: ['"title" must be at most 120 characters.', "title"],
            unknownOwner: ['"userId" must be the id of an existing user.', "userId"],
            noFields: ["Send at least one of: userId, title, company, city, description."],
          }),
          404: jobNotFound,
          415: unsupportedType,
        },
      },
      delete: {
        tags: ["Job postings"],
        summary: "Delete a job posting",
        description: "Week 10, used by the admin panel. Its applications are deleted too (ON DELETE CASCADE).",
        responses: {
          204: { description: "The job posting was deleted. The response has no body." },
          404: jobNotFound,
        },
      },
    },
    "/api/users/{id}/applications": {
      parameters: [userIdParam],
      get: {
        tags: ["Applications"],
        summary: "List the job postings a user applied to",
        description: "The user's applications, oldest first, each with the posting's id, title and company.",
        responses: {
          200: {
            description: "The applications, with the posting's title and company.",
            content: json({ type: "array", items: ref("ApplicationWithJobPosting") }, [
              { ...exampleApplication, jobPosting: { id: 1, title: "Junior Software Developer", company: "Yundt, MacGyver and Hyatt" } },
            ]),
          },
          404: notFound,
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users (views)"],
        summary: "List users (HTML)",
        description:
          "UserDirectoryController.index -> UserModel.getAllWithStatus -> UserTable. Shows the title with a count line, " +
          "a table of users (name as a link, email, school, alumni badge, graduation year, Edit and Delete), " +
          "an \"Add a user\" form, and the empty state \"No users yet. Add the first one.\" when there are none.",
        parameters: [
          {
            name: "created",
            in: "query",
            required: false,
            description: "Id of a just-created user; that row is highlighted with an \"Added <name>\" notice.",
            schema: { type: "integer", example: 4 },
          },
        ],
        responses: { 200: { description: "The users page.", content: html } },
      },
      post: {
        tags: ["Users (views)"],
        summary: "Create a user (form on /users)",
        description:
          "The \"Add a user\" form: createUserAction -> UserController.create -> UserModel.create. " +
          "The Delete button on each row also posts here (deleteUserAction -> UserController.remove), after a confirmation in the browser.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: ref("UserCreate"),
              example: { fullName: "Ayşe Yılmaz", email: "ayse.yilmaz@example.com", age: 24, school: "Istanbul University" },
            },
          },
        },
        responses: {
          303: { description: "Created: redirects to /users?created={id}, which highlights the new user." },
          200: {
            description:
              "Validation error: the page is shown again with the typed values kept and the message under the field, in plain words " +
              "(for example \"Full name is required.\"; the JSON API keeps its own messages).",
            content: html,
          },
        },
      },
    },
    "/login": {
      get: {
        tags: ["Users (views)"],
        summary: "Login page (HTML)",
        description: "The login form: email and password, and a link to /register.",
        responses: { 200: { description: "The login page.", content: html } },
      },
      post: {
        tags: ["Users (views)"],
        summary: "Log in (form on /login)",
        description:
          "loginAction -> AuthController.login -> UserModel.authenticate and lib/session.ts, the same as POST /api/login. " +
          "The Log out button in the header is a POST server action too (logoutAction -> lib/session.ts destroySession).",
        requestBody: {
          required: true,
          content: { "multipart/form-data": { schema: ref("LoginRequest"), example: { email: "ayse.yilmaz@example.com", password: "homecoming-demo" } } },
        },
        responses: {
          303: { description: "Logged in: sets the session cookie and redirects to the home page; the header then shows the user's name and Log out." },
          200: {
            description:
              "Failed: the form again with the email kept (never the password) and \"Email or password is wrong.\" under the form, " +
              "or \"Email is required.\" / \"Password is required.\" under the missing field.",
            content: html,
          },
        },
      },
    },
    "/admin": {
      get: {
        tags: ["Admin (views)"],
        summary: "Admin dashboard (HTML)",
        description: "Admin only. Users by role, the counts of announcements, job postings and applications, and links to the sections.",
        responses: {
          200: { description: "The dashboard.", content: html },
          303: { description: "Not logged in: redirects to /login?next=/admin." },
          403: { description: "Logged in, but not an admin: the 403 page.", content: html },
        },
      },
    },
    "/admin/announcements": {
      get: {
        tags: ["Admin (views)"],
        summary: "Manage announcements (HTML)",
        description:
          "Admin only (Week 10). A table of every announcement (date, title, message) with Edit (/announcements/{id}/edit) and Delete, " +
          "and the form to post a new one. The forms are server actions that post back to this page.",
        responses: {
          200: { description: "The announcements page of the admin panel.", content: html },
          303: { description: "Not logged in: redirects to /login?next=/admin/announcements. After a form: back here with the result." },
          403: { description: "Logged in, but not an admin: the 403 page.", content: html },
        },
      },
    },
    "/admin/jobs": {
      get: {
        tags: ["Admin (views)"],
        summary: "Manage job postings (HTML)",
        description:
          "Admin only (Week 10). Every job posting with its owner's name, Edit (/admin/jobs/{id}/edit) and Delete, and the form to " +
          "create one for any user (choose the owner). The forms are server actions; the API equivalents are POST /api/users/{id}/jobs, " +
          "PATCH and DELETE /api/jobs/{id}.",
        responses: {
          200: { description: "The job postings page of the admin panel.", content: html },
          303: { description: "Not logged in: redirects to /login?next=/admin/jobs. After a form: back here with the result." },
          403: { description: "Logged in, but not an admin: the 403 page.", content: html },
        },
      },
    },
    "/admin/applications": {
      get: {
        tags: ["Admin (views)"],
        summary: "Manage applications (HTML)",
        description:
          "Admin only (Week 10). Every application with the applicant, the posting, the date and the status (a dropdown with Save: " +
          "applied, reviewed, hired or rejected), and Delete. Another status is refused with a message and nothing changes.",
        responses: {
          200: { description: "The applications page of the admin panel.", content: html },
          303: { description: "Not logged in: redirects to /login?next=/admin/applications. After a form: back here with the result." },
          403: { description: "Logged in, but not an admin: the 403 page.", content: html },
        },
      },
    },
    "/admin/users": {
      get: {
        tags: ["Admin (views)"],
        summary: "Manage users (HTML)",
        description:
          "Admin only. A table with name, email, role (a dropdown with Save), alumni, graduation year, Edit (/users/{id}/edit) and Delete. " +
          "The Save and Delete buttons are server actions (changeRoleAction, adminDeleteUserAction) that post back to this page; " +
          "the result is shown at the top, including the message of a safety rule that refused the change.",
        responses: {
          200: { description: "The users page of the admin panel.", content: html },
          303: { description: "Not logged in: redirects to /login?next=/admin/users. After a form: back to /admin/users with the result." },
          403: { description: "Logged in, but not an admin: the 403 page.", content: html },
        },
      },
    },
    "/register": {
      get: {
        tags: ["Users (views)"],
        summary: "Register page (HTML)",
        description:
          "The register form: full name, email, password, confirm password, role (Alumni or Student), " +
          "graduation year (shown only when Alumni is chosen) and an optional school.",
        responses: { 200: { description: "The register page.", content: html } },
      },
      post: {
        tags: ["Users (views)"],
        summary: "Register (form on /register)",
        description: "registerAction -> UserController.register -> UserModel.register, the same model function as POST /api/register.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: ref("RegisterRequest"),
              example: {
                fullName: "Ayşe Yılmaz",
                email: "ayse.yilmaz@example.com",
                password: "a-long-password",
                confirmPassword: "a-long-password",
                role: "STUDENT",
              },
            },
          },
        },
        responses: {
          303: { description: "Registered: redirects to the new user's page, /users/{id}." },
          200: {
            description:
              "Validation error: the form is shown again with the typed values kept (except the two passwords) and each error " +
              "under its field, in plain words. A taken email shows \"An account with this email already exists.\"",
            content: html,
          },
        },
      },
    },
    "/users/{id}": {
      parameters: [userIdParam],
      get: {
        tags: ["Users (views)"],
        summary: "User details (HTML)",
        description:
          "UserDirectoryController.profile -> UserModel.getProfile -> UserDetails and JobPostingTable. Shows the profile " +
          "(initials avatar, name, alumni badge, email, school, graduation year) with Edit and Delete, and the user's job postings " +
          "as a table (\"No postings yet.\" if there are none).",
        parameters: [
          {
            name: "updated",
            in: "query",
            required: false,
            description: "Set after a successful edit; shows a \"Changes saved.\" notice.",
            schema: { type: "integer", example: 1 },
          },
        ],
        responses: {
          200: { description: "The details page.", content: html },
          404: { description: "No user has this id (or the id is not a number): the 404 page (\"There is no page at this address.\") is shown.", content: html },
        },
      },
      post: {
        tags: ["Users (views)"],
        summary: "Delete a user (button on the details page)",
        description:
          "deleteUserAction -> UserController.remove -> UserModel.remove, after a confirmation in the browser. Sends no form fields.",
        responses: {
          303: { description: "Deleted: redirects to /users." },
        },
      },
    },
    "/users/{id}/edit": {
      parameters: [userIdParam],
      get: {
        tags: ["Users (views)"],
        summary: "Edit user form (HTML)",
        description: "UserController.show -> UserModel.getById -> UserForm, prefilled with the user's current values.",
        responses: {
          200: { description: "The edit page.", content: html },
          404: { description: "No user has this id (or the id is not a number): the 404 page (\"There is no page at this address.\") is shown.", content: html },
        },
      },
      post: {
        tags: ["Users (views)"],
        summary: "Update a user (edit form)",
        description:
          "updateUserAction -> UserController.update -> UserModel.update. A partial update: empty fields keep their current value.",
        requestBody: {
          required: true,
          content: { "multipart/form-data": { schema: ref("UserPatch"), example: { age: 25 } } },
        },
        responses: {
          303: { description: "Saved: redirects to /users/{id}?updated=1." },
          200: {
            description: "Validation error, or no field filled in: the form is shown again with the message.",
            content: html,
          },
        },
      },
    },
    "/api/announcements": {
      get: {
        tags: ["Announcements"],
        summary: "List all announcements",
        responses: {
          200: {
            description: "Every stored announcement.",
            content: json({ type: "array", items: ref("Announcement") }, [exampleAnnouncement]),
          },
        },
      },
      post: {
        tags: ["Announcements"],
        summary: "Create an announcement",
        description: "title and content are required; author is optional. id and createdAt are set by the server.",
        requestBody: writeBody("AnnouncementWrite", {
          title: "Alumni meetup in October",
          content: "Graduates and current students are invited to an evening of talks and networking on campus.",
          author: "Alumni Office",
        }),
        responses: {
          201: {
            description: "The created announcement.",
            content: json(ref("Announcement"), {
              id: 4,
              title: "Alumni meetup in October",
              content: "Graduates and current students are invited to an evening of talks and networking on campus.",
              author: "Alumni Office",
              createdAt: "2026-10-12T09:00:00.000Z",
            }),
          },
          400: errorResponse("The body can't be read, or a field is missing or empty.", announcementValidationErrors),
          415: unsupportedType,
        },
      },
    },
    "/api/announcements/{id}": {
      parameters: [announcementIdParam],
      get: {
        tags: ["Announcements"],
        summary: "Get one announcement",
        responses: {
          200: { description: "The announcement.", content: json(ref("Announcement"), exampleAnnouncement) },
          404: announcementNotFound,
        },
      },
      put: {
        tags: ["Announcements"],
        summary: "Replace an announcement",
        description:
          "title and content are required. author is optional, and is removed if it isn't sent. id and createdAt stay the same.",
        requestBody: writeBody("AnnouncementWrite", {
          title: "Welcome to the new Homecoming",
          content: "Please check that your details are still correct.",
        }),
        responses: {
          200: {
            description: "The updated announcement.",
            content: json(ref("Announcement"), {
              id: 1,
              title: "Welcome to the new Homecoming",
              content: "Please check that your details are still correct.",
              createdAt: exampleAnnouncement.createdAt,
            }),
          },
          400: errorResponse("The body can't be read, or a field is missing or empty.", announcementValidationErrors),
          404: announcementNotFound,
          415: unsupportedType,
        },
      },
      patch: {
        tags: ["Announcements"],
        summary: "Update some fields of an announcement",
        description: "Only the fields sent are changed. At least one field is required.",
        requestBody: writeBody("AnnouncementPatch", { author: "Alumni Office" }),
        responses: {
          200: {
            description: "The updated announcement.",
            content: json(ref("Announcement"), { ...exampleAnnouncement, author: "Alumni Office" }),
          },
          400: errorResponse("The body can't be read, no field was sent, or a field is empty.", {
            noFields: ["Send at least one of: title, content, author."],
            emptyTitle: announcementValidationErrors.emptyTitle,
          }),
          404: announcementNotFound,
          415: unsupportedType,
        },
      },
      delete: {
        tags: ["Announcements"],
        summary: "Delete an announcement",
        responses: {
          204: { description: "The announcement was deleted. The response has no body." },
          404: announcementNotFound,
        },
      },
    },
    "/announcements": {
      get: {
        tags: ["Announcements (views)"],
        summary: "List announcements (HTML)",
        description:
          "AnnouncementController.index -> AnnouncementModel.getAll -> AnnouncementList. Shows the announcements as cards, newest first " +
          "(date, title, a 2-line preview, Read more, Edit and Delete), a \"Post an announcement\" form, and the empty state " +
          "\"No announcements yet. Post the first one.\" when there are none.",
        parameters: [
          {
            name: "created",
            in: "query",
            required: false,
            description: "Id of a just-created announcement; that card is highlighted with an \"Added\" notice.",
            schema: { type: "integer", example: 4 },
          },
        ],
        responses: { 200: { description: "The announcements page.", content: html } },
      },
      post: {
        tags: ["Announcements (views)"],
        summary: "Create an announcement (form on /announcements)",
        description:
          "The \"Post an announcement\" form: createAnnouncementAction -> AnnouncementController.create -> AnnouncementModel.create. " +
          "The Delete button on each card also posts here (deleteAnnouncementAction -> AnnouncementController.remove), " +
          "after a confirmation in the browser.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: ref("AnnouncementWrite"),
              example: { title: "Mentors wanted", content: "We are looking for graduates who would like to mentor a student." },
            },
          },
        },
        responses: {
          303: { description: "Created: redirects to /announcements?created={id}, which highlights the new announcement." },
          200: {
            description:
              "Validation error: the page is shown again with the typed values kept and the message under the field, in plain words " +
              "(for example \"Full name is required.\"; the JSON API keeps its own messages).",
            content: html,
          },
        },
      },
    },
    "/announcements/{id}": {
      parameters: [announcementIdParam],
      get: {
        tags: ["Announcements (views)"],
        summary: "Announcement details (HTML)",
        description:
          "AnnouncementController.show -> AnnouncementModel.getById -> AnnouncementDetails. " +
          "Shows the title, the date and the full message, with Edit and Delete buttons.",
        parameters: [
          {
            name: "updated",
            in: "query",
            required: false,
            description: "Set after a successful edit; shows a \"Changes saved.\" notice.",
            schema: { type: "integer", example: 1 },
          },
        ],
        responses: {
          200: { description: "The details page.", content: html },
          404: { description: "No announcement has this id (or the id is not a number): the 404 page (\"There is no page at this address.\") is shown.", content: html },
        },
      },
      post: {
        tags: ["Announcements (views)"],
        summary: "Delete an announcement (button on the details page)",
        description:
          "deleteAnnouncementAction -> AnnouncementController.remove -> AnnouncementModel.remove, " +
          "after a confirmation in the browser. Sends no form fields.",
        responses: {
          303: { description: "Deleted: redirects to /announcements." },
        },
      },
    },
    "/announcements/{id}/edit": {
      parameters: [announcementIdParam],
      get: {
        tags: ["Announcements (views)"],
        summary: "Edit announcement form (HTML)",
        description:
          "AnnouncementController.show -> AnnouncementModel.getById -> AnnouncementForm, prefilled with the current values.",
        responses: {
          200: { description: "The edit page.", content: html },
          404: { description: "No announcement has this id (or the id is not a number): the 404 page (\"There is no page at this address.\") is shown.", content: html },
        },
      },
      post: {
        tags: ["Announcements (views)"],
        summary: "Update an announcement (edit form)",
        description:
          "updateAnnouncementAction -> AnnouncementController.update -> AnnouncementModel.update. " +
          "A partial update: empty fields keep their current value.",
        requestBody: {
          required: true,
          content: { "multipart/form-data": { schema: ref("AnnouncementPatch"), example: { title: "Mentors wanted (2 places left)" } } },
        },
        responses: {
          303: { description: "Saved: redirects to /announcements/{id}?updated=1." },
          200: {
            description: "Validation error, or no field filled in: the form is shown again with the message.",
            content: html,
          },
        },
      },
    },
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check that the API is running",
        responses: {
          200: {
            description: "The API is running.",
            content: json(
              { type: "object", properties: { status: { type: "string" } } },
              { status: "ok" },
            ),
          },
        },
      },
    },
    "/hello": {
      get: {
        tags: ["Examples"],
        summary: "Say hello",
        responses: { 200: { description: "A greeting.", content: text("Hello, World!") } },
      },
    },
    "/hello/{name}": {
      get: {
        tags: ["Examples"],
        summary: "Say hello to someone",
        parameters: [
          { name: "name", in: "path", required: true, schema: { type: "string", example: "anberin" } },
        ],
        responses: {
          200: { description: "A greeting with the name capitalized.", content: text("Hello, Anberin!") },
        },
      },
    },
    "/sum/{number1}/{number2}": {
      get: {
        tags: ["Examples"],
        summary: "Add two numbers",
        parameters: [
          { name: "number1", in: "path", required: true, schema: { type: "number", example: 5 } },
          { name: "number2", in: "path", required: true, schema: { type: "number", example: 10 } },
        ],
        responses: {
          200: { description: "The sum.", content: text("15") },
          400: {
            description: "One of the values is not a number.",
            content: text('Error: "5" and "abc" must both be numbers.'),
          },
        },
      },
    },
  }))),
  components: {
    responses: {
      InternalServerError: {
        description:
          "Unexpected server error, for example the database is down. The body never contains a stack trace or an internal message; " +
          "the full error is printed only in the server's terminal and in logs/error.log.",
        content: json(ref("InternalServerError"), { error: "Internal server error" }),
      },
    },
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "homecoming_session",
        description: "The session cookie set by POST /api/login (httpOnly; the browser sends it by itself).",
      },
    },
    schemas: {
      UserRole: {
        type: "object",
        required: ["role"],
        properties: {
          role: { type: "string", enum: ["ADMIN", "ALUMNI", "STUDENT"], description: "The new role. The last admin can't be demoted." },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", description: "Trimmed and lowercased, like on register." },
          password: { type: "string", format: "password" },
        },
      },
      User: {
        type: "object",
        required: ["id", "fullName", "email"],
        properties: {
          id: { type: "integer", example: 1 },
          fullName: { type: "string", example: "Ayşe Yılmaz" },
          email: { type: "string", format: "email", example: "ayse.yilmaz@example.com" },
          age: { type: "integer", minimum: 1, example: 24, description: "Left out for users who registered (register doesn't ask for it)." },
          school: { type: "string", example: "Istanbul University" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["fullName", "email", "password", "confirmPassword", "role"],
        properties: {
          fullName: { type: "string" },
          email: { type: "string", format: "email", description: "Stored in lowercase; must be unique (a duplicate gives 409)." },
          password: { type: "string", format: "password", minLength: 8, description: "At least 8 characters. Only its bcrypt hash is stored." },
          confirmPassword: { type: "string", format: "password", description: "Must be the same as password. Never stored." },
          role: { type: "string", enum: ["ALUMNI", "STUDENT"], description: "ADMIN can't be chosen." },
          graduationYear: { type: "integer", minimum: 1950, description: "Required for ALUMNI (1950 to the current year); not allowed for STUDENT." },
          school: { type: "string" },
        },
      },
      UserAccount: {
        type: "object",
        description: "A user with their role and alumni status (register, login, /api/me). It never contains the password or its hash; age is left out when the user has none.",
        required: ["id", "fullName", "email", "isAlumni", "role"],
        properties: {
          id: { type: "integer", example: 21 },
          fullName: { type: "string", example: "Ayşe Yılmaz" },
          email: { type: "string", format: "email", example: "ayse.yilmaz@example.com" },
          age: { type: "integer", minimum: 1, example: 24 },
          school: { type: "string", example: "Istanbul University" },
          isAlumni: { type: "boolean", description: "true for ALUMNI accounts." },
          graduationYear: { type: "integer", example: 2023, description: "Only for ALUMNI accounts." },
          role: { type: "string", enum: ["ADMIN", "ALUMNI", "STUDENT"] },
        },
      },
      UserCreate: {
        type: "object",
        required: ["fullName", "email", "age"],
        properties: {
          fullName: { type: "string" },
          email: { type: "string", format: "email", description: "Stored in lowercase; must be unique (a duplicate gives 409)." },
          age: { type: "integer", minimum: 1 },
          school: { type: "string" },
        },
      },
      UserReplace: {
        type: "object",
        required: ["fullName", "email", "age", "school"],
        properties: {
          fullName: { type: "string" },
          email: { type: "string", format: "email", description: "Stored in lowercase; must be unique (a duplicate gives 409)." },
          age: { type: "integer", minimum: 1 },
          school: { type: "string" },
        },
      },
      UserPatch: {
        type: "object",
        minProperties: 1,
        properties: {
          fullName: { type: "string" },
          email: { type: "string", format: "email", description: "Stored in lowercase; must be unique (a duplicate gives 409)." },
          age: { type: "integer", minimum: 1 },
          school: { type: "string" },
        },
      },
      Announcement: {
        type: "object",
        required: ["id", "title", "content", "createdAt"],
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: exampleAnnouncement.title },
          content: { type: "string", example: exampleAnnouncement.content },
          author: { type: "string", example: exampleAnnouncement.author },
          createdAt: { type: "string", format: "date-time", example: exampleAnnouncement.createdAt },
        },
      },
      AnnouncementWrite: {
        type: "object",
        description: "Used by POST and PUT. id and createdAt are set by the server and ignored if sent.",
        required: ["title", "content"],
        properties: {
          title: { type: "string", minLength: 1 },
          content: { type: "string", minLength: 1 },
          author: { type: "string", minLength: 1 },
        },
      },
      AnnouncementPatch: {
        type: "object",
        minProperties: 1,
        properties: {
          title: { type: "string", minLength: 1 },
          content: { type: "string", minLength: 1 },
          author: { type: "string", minLength: 1 },
        },
      },
      UserWithJobs: {
        allOf: [
          ref("User"),
          {
            type: "object",
            required: ["jobs"],
            properties: {
              jobs: {
                type: "array",
                description: "The user's job postings, oldest first. Empty ([]) if the user has none.",
                items: ref("JobPosting"),
              },
            },
          },
        ],
      },
      JobPosting: {
        type: "object",
        required: ["id", "userId", "title", "company", "createdAt"],
        properties: {
          id: { type: "integer", example: 26 },
          userId: { type: "integer", description: "The user who posted it (from the URL).", example: 1 },
          title: { type: "string", maxLength: 120, example: "Junior Data Analyst" },
          company: { type: "string", example: "Example Analytics" },
          city: { type: "string", description: "Optional; left out when empty.", example: "Istanbul" },
          description: { type: "string", description: "Optional long text; left out when empty." },
          createdAt: { type: "string", format: "date-time", example: "2026-10-22T09:00:00.000Z" },
        },
      },
      JobPostingUpdate: {
        type: "object",
        description: "Any of the fields (at least one). userId gives the posting another owner.",
        properties: {
          userId: { type: "integer", minimum: 1, description: "The new owner: the id of an existing user." },
          title: { type: "string", minLength: 1, maxLength: 120 },
          company: { type: "string", minLength: 1 },
          city: { type: "string", minLength: 1 },
          description: { type: "string", minLength: 1 },
        },
      },
      JobPostingCreate: {
        type: "object",
        description: "userId is not sent: it comes from the URL, and one in the body is ignored.",
        required: ["title", "company"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 120, description: "Required; at most 120 characters after trimming." },
          company: { type: "string", minLength: 1, description: "Required." },
          city: { type: "string", minLength: 1, description: "Optional." },
          description: { type: "string", minLength: 1, description: "Optional long text; no length limit." },
        },
      },
      Application: {
        type: "object",
        required: ["id", "userId", "jobPostingId", "status", "createdAt"],
        properties: {
          id: { type: "integer", example: 31 },
          userId: { type: "integer", description: "The applicant.", example: 15 },
          jobPostingId: { type: "integer", description: "The posting (from the URL).", example: 1 },
          status: { type: "string", example: "applied" },
          createdAt: { type: "string", format: "date-time", example: "2026-10-22T10:00:00.000Z" },
        },
      },
      ApplicationStatus: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["applied", "reviewed", "hired", "rejected"], example: "reviewed", description: "The new status. Only the posting's owner or an admin may set it." },
        },
      },
      ApplicationWithUser: {
        allOf: [
          ref("Application"),
          {
            type: "object",
            required: ["user"],
            properties: {
              user: { type: "object", properties: { id: { type: "integer" }, fullName: { type: "string" } } },
            },
          },
        ],
      },
      ApplicationWithJobPosting: {
        allOf: [
          ref("Application"),
          {
            type: "object",
            required: ["jobPosting"],
            properties: {
              jobPosting: {
                type: "object",
                properties: { id: { type: "integer" }, title: { type: "string" }, company: { type: "string" } },
              },
            },
          },
        ],
      },
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: { type: "string", description: "What went wrong." },
          field: { type: "string", description: "The field that failed validation, if any." },
        },
      },
      Forbidden: {
        type: "object",
        description: "The body of every 403 from the JSON API (Week 10): logged in, but this account may not do this.",
        required: ["error", "reason"],
        properties: {
          error: { type: "string", enum: ["Forbidden"], example: "Forbidden" },
          reason: { type: "string", example: "Only an admin can do this." },
        },
      },
      NotFound: {
        type: "object",
        description: "The body of every 404 from the JSON API, including unknown /api paths.",
        required: ["error", "reason"],
        properties: {
          error: { type: "string", enum: ["Not found"], example: "Not found" },
          reason: { type: "string", description: "What was missing.", example: "User 9999 does not exist" },
        },
      },
      InternalServerError: {
        type: "object",
        description: "The body of every 500 from the JSON API. It never contains internal details.",
        required: ["error"],
        properties: {
          error: { type: "string", enum: ["Internal server error"], example: "Internal server error" },
        },
      },
    },
  },
};
