// OpenAPI description of every route in the app (API routes and the /users pages).
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

const exampleUser = {
  id: 1,
  fullName: "Ayşe Yılmaz",
  email: "ayse.yilmaz@example.com",
  age: 24,
  school: "Istanbul University",
};

const userIdParam = {
  name: "id",
  in: "path",
  required: true,
  description: "The user's id.",
  schema: { type: "integer", minimum: 1, example: 1 },
};

const notFound = errorResponse("No user has this id.", {
  notFound: ['User "99" not found.'],
});

const unsupportedType = errorResponse("The Content-Type is not JSON or form data.", {
  unsupported: [
    'Unsupported Content-Type "text/plain". Use application/json, multipart/form-data or application/x-www-form-urlencoded.',
  ],
});

const validationErrors = {
  missingField: ['"email" is required.', "email"] as [string, string],
  invalidEmail: ['"email" must be a valid email address.', "email"] as [string, string],
  duplicateEmail: ['"email" is already used by another user.', "email"] as [string, string],
  invalidAge: ['"age" must be a positive whole number.', "age"] as [string, string],
  invalidJson: ["Request body must be valid JSON."] as [string],
};

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Alumni System API",
    version: "1.0.0",
    description:
      "Users are kept in memory (no database) and reset when the server restarts. The server starts with 3 sample users.\n\n" +
      "Write requests (POST, PUT, PATCH) accept `application/json`, `multipart/form-data` or `application/x-www-form-urlencoded`. " +
      "Any `id` in the body is ignored: ids are generated on create and taken from the URL otherwise.",
  },
  tags: [
    { name: "Users", description: "JSON API for users: create, read, update and delete." },
    {
      name: "Users (views)",
      description:
        "HTML pages for users (page -> UserController -> UserModel -> view components). " +
        "The POST operations are the pages' forms: Next.js server actions that post back to the page URL with an internal action id the page provides. " +
        "They are documented for completeness and can't be sent from Swagger's Try it out; use the Users JSON API for programmatic access.",
    },
    { name: "Health", description: "Check that the API is running." },
    { name: "Examples", description: "Simple plain-text example routes." },
  ],
  paths: {
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
        description: "fullName, email and age are required; school is optional. Emails must be unique (ignoring case).",
        requestBody: writeBody("UserCreate", {
          fullName: "Ayşe Yılmaz",
          email: "ayse.yilmaz@example.com",
          age: 24,
          school: "Istanbul University",
        }),
        responses: {
          201: { description: "The created user.", content: json(ref("User"), exampleUser) },
          400: errorResponse("The body can't be read, or a field is missing or invalid.", validationErrors),
          415: unsupportedType,
        },
      },
    },
    "/api/users/{id}": {
      parameters: [userIdParam],
      get: {
        tags: ["Users"],
        summary: "Get one user",
        responses: {
          200: { description: "The user.", content: json(ref("User"), exampleUser) },
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
            duplicateEmail: validationErrors.duplicateEmail,
          }),
          404: notFound,
          415: unsupportedType,
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete a user",
        responses: {
          204: { description: "The user was deleted. The response has no body." },
          404: notFound,
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users (views)"],
        summary: "List users (HTML)",
        description:
          "UserController.index -> UserModel.getAll -> UserTable. Shows all users with View, Edit and Delete buttons, " +
          "an \"Add a user\" form, and an empty-state message when there are no users.",
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
            description: "Validation error: the page is shown again with the message under the field and the typed values kept.",
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
          "UserController.show -> UserModel.getById -> UserDetails. Shows every field as label/value rows, with Edit and Delete buttons.",
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
          404: { description: "No user has this id: the \"User not found\" page is shown.", content: html },
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
          404: { description: "No user has this id: the \"User not found\" page is shown.", content: html },
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
  },
  components: {
    schemas: {
      User: {
        type: "object",
        required: ["id", "fullName", "email", "age"],
        properties: {
          id: { type: "integer", example: 1 },
          fullName: { type: "string", example: "Ayşe Yılmaz" },
          email: { type: "string", format: "email", example: "ayse.yilmaz@example.com" },
          age: { type: "integer", minimum: 1, example: 24 },
          school: { type: "string", example: "Istanbul University" },
        },
      },
      UserCreate: {
        type: "object",
        required: ["fullName", "email", "age"],
        properties: {
          fullName: { type: "string" },
          email: { type: "string", format: "email", description: "Must be unique (ignoring case)." },
          age: { type: "integer", minimum: 1 },
          school: { type: "string" },
        },
      },
      UserReplace: {
        type: "object",
        required: ["fullName", "email", "age", "school"],
        properties: {
          fullName: { type: "string" },
          email: { type: "string", format: "email", description: "Must be unique (ignoring case)." },
          age: { type: "integer", minimum: 1 },
          school: { type: "string" },
        },
      },
      UserPatch: {
        type: "object",
        minProperties: 1,
        properties: {
          fullName: { type: "string" },
          email: { type: "string", format: "email", description: "Must be unique (ignoring case)." },
          age: { type: "integer", minimum: 1 },
          school: { type: "string" },
        },
      },
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: { type: "string", description: "What went wrong." },
          field: { type: "string", description: "The field that failed validation, if any." },
        },
      },
    },
  },
};
