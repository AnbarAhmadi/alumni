// OpenAPI description of every route handler in the app.
// Keep this in sync when routes change.

const json = (schema: object) => ({ "application/json": { schema } });
const text = (example: string) => ({ "text/plain": { schema: { type: "string", example } } });
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

const errorResponse = (description: string, example: string) => ({
  description,
  content: json({ ...ref("Error"), example: { error: example } }),
});

const userIdParam = {
  name: "id",
  in: "path",
  required: true,
  description: "The user's id.",
  schema: { type: "integer", minimum: 1, example: 1 },
};

const notFound = errorResponse("No user has this id.", 'User "99" not found.');
const invalidBody = errorResponse(
  "The body is not valid JSON, or a field is missing or invalid.",
  '"email" is required.',
);

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Alumni System API",
    version: "1.0.0",
    description: "Users are kept in memory and are cleared whenever the server restarts.",
  },
  tags: [
    { name: "Health", description: "Check that the API is running." },
    { name: "Users", description: "Create, read, update and delete users." },
    { name: "Examples", description: "Simple plain-text example routes." },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check that the API is running",
        responses: {
          200: {
            description: "The API is running.",
            content: json({
              type: "object",
              properties: { status: { type: "string", example: "ok" } },
            }),
          },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List all users",
        responses: {
          200: {
            description: "Every stored user.",
            content: json({ type: "array", items: ref("User") }),
          },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create a user",
        description: "The id is assigned by the server, counting up from 1.",
        requestBody: { required: true, content: json(ref("UserInput")) },
        responses: {
          201: { description: "The created user.", content: json(ref("User")) },
          400: invalidBody,
        },
      },
    },
    "/api/users/{id}": {
      parameters: [userIdParam],
      get: {
        tags: ["Users"],
        summary: "Get one user",
        responses: {
          200: { description: "The user.", content: json(ref("User")) },
          404: notFound,
        },
      },
      put: {
        tags: ["Users"],
        summary: "Replace a user",
        description: "Every field must be sent. The id cannot be changed.",
        requestBody: { required: true, content: json(ref("UserInput")) },
        responses: {
          200: { description: "The updated user.", content: json(ref("User")) },
          400: invalidBody,
          404: notFound,
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update some fields of a user",
        description:
          "Only the fields sent are changed. At least one field is required. The id cannot be changed.",
        requestBody: { required: true, content: json(ref("UserPatch")) },
        responses: {
          200: { description: "The updated user.", content: json(ref("User")) },
          400: invalidBody,
          404: notFound,
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete a user",
        responses: {
          200: { description: "The user that was deleted.", content: json(ref("User")) },
          404: notFound,
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
        required: ["id", "fullName", "email", "school", "age"],
        properties: {
          id: { type: "integer", example: 1 },
          fullName: { type: "string", example: "Anberin Ahmadi" },
          email: { type: "string", example: "a@example.com" },
          school: { type: "string", example: "UNI" },
          age: { type: "integer", minimum: 1, example: 21 },
        },
      },
      UserInput: {
        type: "object",
        required: ["fullName", "email", "school", "age"],
        properties: {
          fullName: { type: "string", example: "Anberin Ahmadi" },
          email: { type: "string", example: "a@example.com" },
          school: { type: "string", example: "UNI" },
          age: { type: "integer", minimum: 1, example: 21 },
        },
      },
      UserPatch: {
        type: "object",
        minProperties: 1,
        properties: {
          fullName: { type: "string", example: "Anberin Ahmadi" },
          email: { type: "string", example: "a@example.com" },
          school: { type: "string", example: "UNI" },
          age: { type: "integer", minimum: 1, example: 22 },
        },
      },
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
    },
  },
};
