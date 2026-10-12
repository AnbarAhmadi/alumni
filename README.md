# Alumni Tracking System

**Management Information Systems Department — Istanbul University**
> A full-stack web platform that keeps universities connected to their graduates, built from scratch as a semester-long project for the Web Programming course.

---
## 📖 About

The Web-Based Alumni Tracking System is a centralized platform built to strengthen the connection between Istanbul University and its graduates, since universities frequently lose contact with students after graduation. It replaces scattered, department-by-department record-keeping with one secure database, keeps alumni information current through user-driven profile updates, and helps current students and graduates connect for mentorship and professional networking.

All project decisions and progress — architecture decisions, design, and each round of development — are documented and version-controlled in this repository as the semester unfolds.

---
## 🎓 Prior Coursework: System Analysis & Design

The system analysis and design work behind this project was completed previously, as an assignment for the **System Analysis and Design** course. That earlier deliverable already covers the mandatory analysis and design content this project builds on:

1. **System Overview** — title, team members, course info, project introduction, problem definition, scope and assumptions
2. **Requirements Analysis** — functional and non-functional requirements, user requirements and stakeholder groups, constraints and business rules
3. **Use Case Analysis** — use case list, use case diagram, and detailed use case description
4. **Process Modeling** — activity diagram and system workflow
5. **Data Modeling** — entity–relationship diagram (ERD) and data dictionary
6. **System & Architecture Design** — system architecture (layered/client–server/MVC), hardware and software architecture overview
7. **User Interface Design** — UI mockups and navigation structure (site map)
8. **Program Design** — sequence diagram, class diagram, module descriptions
9. **Quality Assurance & Transition** — testing strategy, risks and mitigation plan, deployment/transition considerations
10. **Conclusion** — expected benefits, limitations, future enhancements

This Web Programming implementation carries that analysis and design forward into working code; where this build diverges from the original design (e.g. the deferred authentication noted under Current Limitations), it is called out explicitly rather than left implicit.

---
## ✨ Features

The work is done week by week. Each item below matches commits in this repository's Git history.

### Week 1 (16–22 Sep 2026): Repository and documentation
- [x] Created the GitHub repository
- [x] Wrote the first README: project overview, prior coursework and course information
- [x] Added the Tech Stack section

### Week 2 (23–24 Sep 2026): Next.js setup and first routes
- [x] Set up the Next.js app (App Router, TypeScript)
- [x] `GET /hello`: returns `Hello, World!` as plain text
- [x] `GET /hello/:name`: greets the name from the URL, capitalized (`/hello/anberin` → `Hello, Anberin!`)
- [x] `GET /sum/:number1/:number2`: adds two numbers, and returns `400` if either one is not a number
- [x] Home page with the site header, navigation, footer and "Explore" cards
- [x] About page (`/about`)

### Week 3 (30 Sep 2026): Users JSON API and Swagger
- [x] `GET /api/health`: returns `{ "status": "ok" }`
- [x] `POST /api/users`: creates a user in an in-memory store
- [x] `GET /api/users` and `GET /api/users/:id`: list all users, or read one
- [x] `PUT` and `PATCH /api/users/:id`: replace a whole user, or change only some fields
- [x] `DELETE /api/users/:id`: deletes a user
- [x] Users have `fullName`, `email`, `age` and an optional `school`, with validation and clear error messages
- [x] Swagger UI at `/api/swagger`

### Week 4 (7 Oct 2026): MVC refactor and the `/users` web pages
- [x] `POST /api/users` accepts `multipart/form-data` and urlencoded forms as well as JSON
- [x] One shared body parser (`lib/parseBody.ts`), so `PUT` and `PATCH` accept the same formats
- [x] Moved all user data and validation into one **Model** (`models/User.ts`)
- [x] Added two **Controllers**: `ApiUserController` for the JSON API and `UserController` for the web pages
- [x] Route files are now thin: each one only hands the request to a controller
- [x] Added the **Views**: React components for the users table, details, form, delete button and navigation
- [x] `/users` pages with full CRUD: list, create, view, edit and delete, using Next.js server actions
- [x] Form errors are shown under the field that caused them, and the typed values are kept
- [x] A "User not found" page for unknown ids
- [x] Swagger now also documents the `/users` pages
- [x] Fixed `npm run lint` (ESLint needs the TypeScript 6 API, so it is installed next to TypeScript 7)
- [x] Documented the MVC architecture in this README

### Upcoming
- [ ] **Database:** Supabase (hosted PostgreSQL) with Prisma, replacing the in-memory store in `models/User.ts`
- [ ] **Alumni records:** graduation details and current job, with their own pages and API routes
- [ ] **Alumni Directory:** search graduates by year, program, company or city
- [ ] **My Profile:** graduates keep their own contact and career details up to date
- [ ] **Mentorship:** connect current students with graduates
- [ ] **Events & Reunions, Careers & Jobs, News & Success Stories, Contact** pages (shown as "Coming soon" on the home page today)
- [ ] **Authentication:** login and roles
- [ ] **Data export:** export records to CSV and Excel
- [ ] **Docker:** a Dockerfile and Docker Compose setup

---
## 🛠️ Tech Stack

| Category | Technology | Notes |
| --- | --- | --- |
| Language | TypeScript | TypeScript 7 for type checking; the TypeScript 6 API is installed alongside it because ESLint needs it |
| Framework | Next.js 16 (App Router), React 19 | Pages, API routes and server actions all live in `app/` |
| Runtime | Node.js | Developed with Node.js 24 |
| Architecture | MVC | One model, two controllers, React view components |
| Data storage | In memory (`models/User.ts`) | No database yet; data resets when the server restarts |
| API documentation | OpenAPI 3.0 + Swagger UI | The spec is written in `app/api/swagger/openapi.ts`; Swagger UI is loaded from the unpkg CDN |
| Code quality | ESLint 9 with `eslint-config-next` | Next.js core-web-vitals and TypeScript rules |
| Package manager | npm | |
| Version control | Git and GitHub | One commit per change; the Week 4 work is on the `mvc-refactor` branch |
| Planned | Supabase (PostgreSQL), Prisma, Docker | Not in the repository yet; see Upcoming above |

---
## 📁 Project Structure

Every file that is committed to the repository, with what it does:

```
alumni/
├── app/                                  # Next.js App Router: a file's folder path is its URL
│   ├── layout.tsx                        # Wraps every page: site header, navigation links and footer
│   ├── page.tsx                          # Home page (/): hero section and the "Explore" cards
│   ├── globals.css                       # Styles for the whole site, including the /users pages
│   ├── about/
│   │   └── page.tsx                      # About page (/about): what the system is for
│   ├── users/                            # The users web pages (HTML)
│   │   ├── page.tsx                      # /users: users table and the "Add a user" form
│   │   ├── actions.ts                    # Server actions for the forms: create, update and delete
│   │   └── [id]/                         # [id] is the user's id from the URL
│   │       ├── page.tsx                  # /users/:id: one user's details, with Edit and Delete
│   │       ├── not-found.tsx             # "User not found" page for an unknown id
│   │       └── edit/
│   │           └── page.tsx              # /users/:id/edit: the edit form, filled with the user's data
│   ├── api/                              # JSON API routes
│   │   ├── health/
│   │   │   └── route.ts                  # GET /api/health: says the server is running
│   │   ├── users/
│   │   │   ├── route.ts                  # GET and POST /api/users → ApiUserController
│   │   │   └── [id]/
│   │   │       └── route.ts              # GET, PUT, PATCH and DELETE /api/users/:id → ApiUserController
│   │   └── swagger/
│   │       ├── route.ts                  # GET /api/swagger: the Swagger UI page
│   │       ├── openapi.ts                # The OpenAPI description of every route
│   │       └── openapi.json/
│   │           └── route.ts              # GET /api/swagger/openapi.json: serves the spec as JSON
│   ├── hello/
│   │   ├── route.ts                      # GET /hello: plain-text "Hello, World!"
│   │   └── [name]/
│   │       └── route.ts                  # GET /hello/:name: plain-text greeting with the name
│   └── sum/
│       └── [number1]/
│           └── [number2]/
│               └── route.ts              # GET /sum/:number1/:number2: adds the two numbers
├── models/                               # MODEL
│   └── User.ts                           # User type, in-memory store with 3 sample users, validation, UserModel CRUD
├── controllers/                          # CONTROLLERS
│   ├── ApiUserController.ts              # For /api/users: calls UserModel and returns JSON with status codes
│   └── UserController.ts                 # For /users: calls UserModel and returns { ok, data, error, field }
├── components/                           # VIEWS (React components)
│   ├── UserTable.tsx                     # Table of users with View, Edit and Delete; "Added <name>" notice
│   ├── UserDetails.tsx                   # One user as label/value rows
│   ├── UserForm.tsx                      # Create and edit form; shows errors under the right field (client component)
│   ├── DeleteUserButton.tsx              # Delete button that asks "Delete <name>?" first (client component)
│   └── UserNav.tsx                       # Links: All users, Details, Edit, + New user
├── lib/                                  # Helpers shared by the controllers
│   └── parseBody.ts                      # Reads JSON, multipart/form-data and urlencoded bodies; turns age into a number
├── eslint.config.mjs                     # ESLint setup (Next.js recommended rules + TypeScript rules)
├── next.config.ts                        # Next.js settings (output: "standalone")
├── tsconfig.json                         # TypeScript settings; "@/..." imports start at the project root
├── package.json                          # Project name, npm scripts and dependencies
├── package-lock.json                     # Exact installed versions of the dependencies
├── .gitignore                            # Keeps node_modules, .next, .env files and local Postman files out of Git
├── AGENTS.md                             # Notes for AI coding tools about this Next.js version (written by next dev)
├── CLAUDE.md                             # Points to AGENTS.md
└── README.md                             # This file
```

Folders that exist on a developer's machine but are **not** committed: `node_modules/` (installed packages), `.next/` (build output) and `postman/` (local Postman files).

---
## 🏗️ MVC Architecture

### How the app is split

The app follows **MVC (Model–View–Controller)**. Each part has one job:

| Part | Job in this app | Where |
| --- | --- | --- |
| **Model** | Holds the users, checks the data is valid, and does create, read, update and delete. It has no HTTP or React code. | `models/User.ts` (`UserModel`) |
| **View** | Shows data on the screen. The components only display what they are given and never touch the model. | `components/` |
| **Controller** | Sits in the middle: takes the request, calls the model, and decides what to send back. | `controllers/` |

In Next.js the `app/` folder is the router: where a file is decides its URL. I kept those route files thin, so they only pass the request to a controller.

There are **two controllers** for the **same model**, because the two kinds of client need different answers:

- **`ApiUserController`** is for programs (curl, Postman, Swagger). It returns JSON with HTTP status codes (`200`, `201`, `204`, `400`, `404`, `415`).
- **`UserController`** is for the web pages. It returns a result object `{ ok, data, error, field }`, and the page decides which view to show.

Both controllers reach the data only through `UserModel`. When the database is added, only `models/User.ts` should need to change.

### Files by MVC role

| Role | Files | What they do |
| --- | --- | --- |
| Model | `models/User.ts` | `User` type, in-memory store, validation (`ValidationError`), `UserModel.getAll`, `getById`, `create`, `update`, `replace`, `remove` |
| Controller (API) | `controllers/ApiUserController.ts` | `getAll`, `getById`, `create`, `update`, `replace`, `remove`, which return JSON responses |
| Controller (web) | `controllers/UserController.ts` | `index`, `show`, `create`, `update`, `remove`, which return `{ ok, data, error, field }` |
| Controller helper | `lib/parseBody.ts` | `parseBody` reads the request body; `formDataToObject` turns form fields into an object |
| View | `components/UserTable.tsx`, `UserDetails.tsx`, `UserForm.tsx`, `DeleteUserButton.tsx`, `UserNav.tsx` | React components that render the users |
| View (pages) | `app/users/page.tsx`, `app/users/[id]/page.tsx`, `app/users/[id]/edit/page.tsx`, `app/users/[id]/not-found.tsx` | Call `UserController`, then put the view components on the page |
| Form handlers | `app/users/actions.ts` | Server actions `createUserAction`, `updateUserAction` and `deleteUserAction`, which call `UserController` and then redirect |
| Routes (API) | `app/api/users/route.ts`, `app/api/users/[id]/route.ts` | Map each HTTP method to an `ApiUserController` function |
| Layout and static pages | `app/layout.tsx`, `app/page.tsx`, `app/about/page.tsx`, `app/globals.css` | Shared layout, styles and pages that don't use user data |
| Outside MVC | `app/api/health`, `app/api/swagger`, `app/hello`, `app/sum` | Small routes with no data, so they answer directly |

### Route → controller → model → view

**Web pages** (`UserController`):

| Route | Server action | Controller function | Model function | View |
| --- | --- | --- | --- | --- |
| `GET /users` | — | `UserController.index` | `UserModel.getAll` | `UserTable`, `UserForm` |
| `POST /users` (Add a user form) | `createUserAction` | `UserController.create` | `UserModel.create` | Redirects to `/users?created=:id`; errors are shown in `UserForm` |
| `POST /users` (Delete in a table row) | `deleteUserAction` | `UserController.remove` | `UserModel.remove` | Redirects to `/users` |
| `GET /users/:id` | — | `UserController.show` | `UserModel.getById` | `UserNav`, `UserDetails`, `DeleteUserButton`; `not-found.tsx` if there is no such user |
| `POST /users/:id` (Delete) | `deleteUserAction` | `UserController.remove` | `UserModel.remove` | Redirects to `/users` |
| `GET /users/:id/edit` | — | `UserController.show` | `UserModel.getById` | `UserNav`, `UserForm` filled in; `not-found.tsx` if there is no such user |
| `POST /users/:id/edit` (Save changes) | `updateUserAction` | `UserController.update` | `UserModel.update` | Redirects to `/users/:id?updated=1`; errors are shown in `UserForm` |

The `POST` rows are form submissions. A Next.js server action posts back to the URL of the page the form is on.

**JSON API** (`ApiUserController`). Here the "view" is the JSON response:

| Route | Controller function | Model function(s) | Response |
| --- | --- | --- | --- |
| `GET /api/users` | `ApiUserController.getAll` | `UserModel.getAll` | `200` array of users |
| `POST /api/users` | `ApiUserController.create` | `UserModel.create` | `201` new user; `400`; `415` |
| `GET /api/users/:id` | `ApiUserController.getById` | `UserModel.getById` | `200` user; `404` |
| `PUT /api/users/:id` | `ApiUserController.replace` | `UserModel.getById`, `UserModel.replace` | `200` user; `400`; `404`; `415` |
| `PATCH /api/users/:id` | `ApiUserController.update` | `UserModel.getById`, `UserModel.update` | `200` user; `400`; `404`; `415` |
| `DELETE /api/users/:id` | `ApiUserController.remove` | `UserModel.remove` | `204` no body; `404` |

### Request flow 1: creating a user with `POST /api/users` (curl)

```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Zeynep Arslan","email":"zeynep.arslan@example.com","age":23,"school":"Istanbul University"}'
```

1. **Route:** `app/api/users/route.ts` receives the POST and calls `ApiUserController.create(request)`.
2. **Controller:** `create` calls `parseBody(request)` from `lib/parseBody.ts`. The `Content-Type` is `application/json`, so the body is read as JSON, and any `id` in it is dropped. The controller then passes the object to `UserModel.create`.
3. **Model:** `UserModel.create` checks that `fullName`, `email` and `age` are there, that the email looks valid and isn't already used, and that `age` is a positive whole number. It gives the user the next id, adds them to the in-memory list and returns them.
4. **Response:** the controller sends back `201 Created` with the new user:

   ```json
   {"id":4,"fullName":"Zeynep Arslan","email":"zeynep.arslan@example.com","age":23,"school":"Istanbul University"}
   ```

If something is wrong, the model throws a `ValidationError` and the controller turns it into a `400` that names the field, for example `{"error":"\"email\" must be a valid email address.","field":"email"}`. An unsupported `Content-Type` (for example `text/plain`) gets a `415`.

The same request also works as form-data, for example `curl -X POST http://localhost:3000/api/users -F fullName="Can Öz" -F email=can.oz@example.com -F age=25`. `parseBody` turns the text `"25"` into the number `25`.

### Request flow 2: creating a user from the `/users` form

1. **View:** at `http://localhost:3000/users` the user fills in the **Add a user** form (`components/UserForm.tsx`) and clicks **Create user**. The button shows "Saving…" while the form is sending.
2. **Server action:** the form posts to `createUserAction` in `app/users/actions.ts`, which calls `UserController.create(formData)`.
3. **Controller:** `UserController.create` uses `formDataToObject` to turn the form fields into an object (empty fields are skipped, `age` becomes a number) and calls `UserModel.create`. A `ValidationError` is caught and returned as `{ ok: false, error, field }`.
4. **Model:** `UserModel.create` runs the same validation as in flow 1 and saves the user.
5. **Back to the page:**
   - **Success:** the action refreshes `/users` (`revalidatePath`) and redirects to `/users?created=4`. The page calls `UserController.index()` again, and `UserTable` highlights the new row with the notice "Added Zeynep Arslan."
   - **Error:** the action returns the error, the field name and the typed values. `UserForm` shows the message under the wrong field and keeps what the user typed.

---
## 🧭 All Routes

### Web pages

| URL | Method | What it shows or does | CRUD |
| --- | --- | --- | --- |
| `/` | GET | Home page with the "Explore" cards | — |
| `/about` | GET | About the Alumni System | — |
| `/users` | GET | Table of all users and the "Add a user" form | Read |
| `/users` | POST (form) | Add a user form → `createUserAction` | Create |
| `/users` | POST (form) | Delete button in a table row → `deleteUserAction` | Delete |
| `/users/:id` | GET | One user's details, with Edit and Delete buttons | Read |
| `/users/:id` | POST (form) | Delete button → `deleteUserAction` | Delete |
| `/users/:id/edit` | GET | Edit form filled with the user's data | Read |
| `/users/:id/edit` | POST (form) | Save changes → `updateUserAction` (only the filled-in fields change) | Update |

An unknown id on `/users/:id` or `/users/:id/edit` shows the "User not found" page with a `404` status.

### JSON API

| URL | Method | What it does | CRUD |
| --- | --- | --- | --- |
| `/api/users` | GET | List all users | Read |
| `/api/users` | POST | Create a user (`fullName`, `email` and `age` required; `school` optional) | Create |
| `/api/users/:id` | GET | Get one user | Read |
| `/api/users/:id` | PUT | Replace the whole user (all four fields required) | Update |
| `/api/users/:id` | PATCH | Change only the fields that are sent | Update |
| `/api/users/:id` | DELETE | Delete the user | Delete |

### Other routes

| URL | Method | What it returns |
| --- | --- | --- |
| `/api/health` | GET | `{ "status": "ok" }` |
| `/api/swagger` | GET | Swagger UI page |
| `/api/swagger/openapi.json` | GET | The OpenAPI spec as JSON |
| `/hello` | GET | `Hello, World!` (plain text) |
| `/hello/:name` | GET | `Hello, <Name>!` (plain text) |
| `/sum/:number1/:number2` | GET | The sum as plain text, for example `/sum/2/3` → `5`; `400` if either one isn't a number |

---
## 📚 API Documentation

With the app running (`npm run dev`), open the Swagger UI:

**http://localhost:3000/api/swagger**

The raw OpenAPI spec is at http://localhost:3000/api/swagger/openapi.json. Swagger UI is loaded from the unpkg CDN, so the page needs an internet connection.

Swagger groups the routes into four tags:

- **Users:** the JSON API. Each operation shows its request body (as JSON or form-data), its response codes and examples. Use **Try it out** to send real requests from the browser.
- **Users (views):** the `/users` HTML pages and their forms. The form submissions are server actions, so they are documented but can't be sent with Try it out.
- **Health:** `/api/health`.
- **Examples:** `/hello`, `/hello/{name}` and `/sum/{number1}/{number2}`.

The API routes:

| Method | Path | Request body | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/users` | — | `200` array of users | — |
| POST | `/api/users` | `fullName`, `email`, `age` (required), `school` (optional) | `201` new user | `400` invalid data, `415` unsupported Content-Type |
| GET | `/api/users/{id}` | — | `200` user | `404` not found |
| PUT | `/api/users/{id}` | `fullName`, `email`, `age`, `school` (all required) | `200` updated user | `400`, `404`, `415` |
| PATCH | `/api/users/{id}` | Any of `fullName`, `email`, `age`, `school` (at least one) | `200` updated user | `400`, `404`, `415` |
| DELETE | `/api/users/{id}` | — | `204` no body | `404` not found |
| GET | `/api/health` | — | `200` `{ "status": "ok" }` | — |

POST, PUT and PATCH accept `application/json`, `multipart/form-data` and `application/x-www-form-urlencoded`. An `id` sent in the body is always ignored: new ids are generated, and other ids come from the URL. Errors come back as `{ "error": "..." }`, with a `field` when one field is to blame.

---
## ⚠️ Current Limitations

- **No database yet.** Users are kept in memory, so all changes are lost when the server restarts. Every start begins again with the same 3 sample users. The data also lives inside a single server process, so separate server instances wouldn't share it.
- **No login.** Authentication is deferred for now, so anyone who can open the site can create, edit and delete users, on the pages and through the API.
- **Only one kind of record.** There is a generic "user" (name, email, age, school). Alumni details such as graduation year, program or current job aren't modelled yet.
- **Most home page sections are placeholders.** Apart from About, the "Explore" cards are marked "Coming soon", and the matching navigation links only jump to those cards on the home page.
- **The edit form can't clear a field.** Empty fields keep their old value, so `school` can't be removed from the web form. A `PUT` through the API replaces the whole user.
- **No search, sorting or paging** on the users list.
- **No automated tests yet.** Routes have been checked by hand, with curl, Postman and Swagger.
- **Swagger needs internet**, because Swagger UI is loaded from a CDN.

---
## 🚀 Getting Started

### Prerequisites

- Node.js 20.9 or later (developed with Node.js 24)
- npm

No database or environment variables are needed.

### Install and run

```bash
npm install
npm run dev
```

Then open:

| URL | What you'll see |
| --- | --- |
| http://localhost:3000 | Home page |
| http://localhost:3000/users | Users pages: list, create, view, edit, delete |
| http://localhost:3000/api/users | The users as JSON |
| http://localhost:3000/api/swagger | Swagger API documentation |
| http://localhost:3000/api/health | Health check |

To try the API from a terminal, use the curl example under [Request flow 1](#request-flow-1-creating-a-user-with-post-apiusers-curl).

---
## 👤 Author

**Anberin Ahmadi**
Management Information Systems student, Istanbul University

---
## 🏫 Course Information

- **Course:** Web Programming
- **Department:** Management Information Systems, Istanbul University
- **Student:** Anberin Ahmadi
- **Evaluation:** The instructor will select the student project that best demonstrates a working website to actually implement and use as the department's official alumni tracking platform.

---
## 📄 License

This project was developed for academic purposes as part of the Web Programming course at Istanbul University. It is not licensed for external use, redistribution, or commercial purposes without permission.
