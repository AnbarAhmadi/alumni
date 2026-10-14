# Alumni Tracking System

**Management Information Systems Department — Istanbul University**

> A full-stack web platform that keeps universities connected to their graduates, built from scratch as a semester-long project for the Web Programming course.

Data design: see [ddd.md](ddd.md)

---

## 📖 About

The Web-Based Alumni Tracking System is a centralized platform built to strengthen the connection between Istanbul University and its graduates, since universities frequently lose contact with students after graduation. It aims to replace scattered, department-by-department record-keeping with one central database, keep alumni information current through user-driven profile updates, and help current students and graduates connect for mentorship and professional networking.

All project decisions and progress, including architecture, design and each round of development, are documented and version-controlled in this repository as the semester unfolds.

---

## 🎓 Prior Coursework: System Analysis & Design

The analysis and design of this system were completed earlier in the **System Analysis and Design** course. There we produced the full documentation (requirements, use cases, process models, ERD, UI mockups and UML diagrams) and also developed a working system. This Web Programming project carries that work forward into working code. Where it differs from the original design (for example, authentication is postponed, see Current Limitations), the difference is stated explicitly.

---

## ✨ Features

This project is being built incrementally over the semester. Status is updated weekly.

- [x] **Week 2:** Next.js setup, first routes (`/hello`, `/hello/:name`, `/sum/:a/:b`), home and About pages
- [x] **Week 3:** Users JSON API with full CRUD (`/api/users`), health check, Swagger UI
- [x] **Week 4:** MVC refactor (one model, two controllers, view components), `/users` web pages with list, create, view, edit and delete, and an Announcements module (model, two controllers, routes, `/announcements` pages)

### Upcoming

- [ ] **Database:** Supabase (hosted PostgreSQL) with Prisma, replacing the in-memory stores of users and announcements in `models/User.ts` and `models/Announcement.ts`
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
| Data storage | In memory (`models/User.ts` and `models/Announcement.ts`) | No database yet; data resets when the server restarts |
| Database (planned) | Supabase (PostgreSQL) with Prisma | Not added yet; it will replace the in-memory data (see Upcoming) |
| API documentation | OpenAPI 3.0 + Swagger UI | The spec is written in `app/api/swagger/openapi.ts`; Swagger UI is loaded from the unpkg CDN, so it needs an internet connection |
| Code quality | ESLint 9 with `eslint-config-next` | Next.js core-web-vitals and TypeScript rules |
| Package manager | npm | |
| Containerization | Docker and Docker Compose | Runs the app in a container |
| Version control | Git and GitHub | One commit per task, with the week in the message (for example "Week 4: ...") |

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
│   ├── announcements/                    # The announcements web pages (HTML)
│   │   ├── page.tsx                      # /announcements: announcements table and the "Add an announcement" form
│   │   ├── actions.ts                    # Server actions for the forms: create, update and delete
│   │   └── [id]/                         # [id] is the announcement's id from the URL
│   │       ├── page.tsx                  # /announcements/:id: one announcement's details, with Edit and Delete
│   │       ├── not-found.tsx             # "Announcement not found" page for an unknown id
│   │       └── edit/
│   │           └── page.tsx              # /announcements/:id/edit: the edit form, filled with the current values
│   ├── api/                              # JSON API routes
│   │   ├── health/
│   │   │   └── route.ts                  # GET /api/health: says the server is running
│   │   ├── users/
│   │   │   ├── route.ts                  # GET and POST /api/users → ApiUserController
│   │   │   └── [id]/
│   │   │       └── route.ts              # GET, PUT, PATCH and DELETE /api/users/:id → ApiUserController
│   │   ├── announcements/
│   │   │   ├── route.ts                  # GET and POST /api/announcements → ApiAnnouncementController
│   │   │   └── [id]/
│   │   │       └── route.ts              # GET, PUT, PATCH and DELETE /api/announcements/:id → ApiAnnouncementController
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
│   ├── User.ts                           # User type, in-memory store with 3 sample users, validation, UserModel CRUD
│   └── Announcement.ts                   # Announcement type, in-memory store with 3 samples, validation, AnnouncementModel CRUD
├── controllers/                          # CONTROLLERS
│   ├── ApiUserController.ts              # For /api/users: calls UserModel and returns JSON with status codes
│   ├── UserController.ts                 # For /users: calls UserModel and returns { ok, data, error, field }
│   ├── ApiAnnouncementController.ts      # For /api/announcements: calls AnnouncementModel and returns JSON with status codes
│   └── AnnouncementController.ts         # For /announcements: calls AnnouncementModel and returns { ok, data, error, field }
├── components/                           # VIEWS (React components)
│   ├── UserTable.tsx                     # Table of users with View, Edit and Delete; "Added <name>" notice
│   ├── UserDetails.tsx                   # One user as label/value rows
│   ├── UserForm.tsx                      # Create and edit form; shows errors under the right field (client component)
│   ├── DeleteUserButton.tsx              # Delete button that asks "Delete <name>?" first (client component)
│   ├── UserNav.tsx                       # Links: All users, Details, Edit, + New user
│   ├── AnnouncementTable.tsx             # Table of announcements with View, Edit and Delete; "Added" notice
│   ├── AnnouncementDetails.tsx           # One announcement as label/value rows; formats the createdAt date
│   ├── AnnouncementForm.tsx              # Create and edit form with a content box; errors under the right field (client component)
│   ├── DeleteAnnouncementButton.tsx      # Reuses DeleteUserButton with the announcement title in the confirmation
│   └── AnnouncementNav.tsx               # Links: All announcements, Details, Edit, + New announcement
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
├── ddd.md                                # Data design: data dictionary, types, validation, ER diagram, planned database
└── README.md                             # This file
```

Folders that exist on a developer's machine but are **not** committed: `node_modules/` (installed packages), `.next/` (build output) and `postman/` (local Postman files).

---

## 🏗️ MVC Architecture

The app follows **MVC (Model–View–Controller)**. Each part has one job:

| Part | Job in this app | Where |
| --- | --- | --- |
| **Model** | Holds the users, checks the data is valid, and does create, read, update and delete. It has no HTTP or React code. | `models/User.ts` (`UserModel`) |
| **View** | Shows data on the screen. The components only display what they are given and never touch the model. | `components/` |
| **Controller** | Sits in the middle: takes the request, calls the model, and decides what to send back. | `controllers/` |

In Next.js the `app/` folder is the router: where a file is decides its URL. The route and page files are kept thin, so they only pass the request to a controller. The small routes with no data (`/api/health`, `/api/swagger`, `/hello`, `/sum`) answer directly.

There are **two controllers** for the **same model**, because the two kinds of client need different answers:

- **`ApiUserController`** is for programs (curl, Postman, Swagger). It returns JSON with HTTP status codes (`200`, `201`, `204`, `400`, `404`, `415`).
- **`UserController`** is for the web pages. It returns a result object `{ ok, data, error, field }`, and the page decides which view to show.

Both controllers reach the data only through `UserModel`. When the database is added, only `models/User.ts` should need to change.

### Example: how a request travels through MVC

`POST /api/users` with a JSON body:

1. **Route** (`app/api/users/route.ts`) receives the request and passes it to the controller.
2. **Controller** (`ApiUserController.create`) reads the body with `parseBody` and calls the model.
3. **Model** (`UserModel.create`) validates the data, saves the user and returns it.
4. **Response:** the controller sends `201 Created` with the new user, or `400` with the field name if validation fails.

The `/users` web form follows the same path, except a server action (`createUserAction`) and `UserController` replace the route and `ApiUserController`, and the result is shown by `UserForm` and `UserTable`.

### Announcements use the same pattern

Announcements (`title`, `content`, optional `author`, and a `createdAt` date set by the server) are built exactly like users, with one model and two controllers:

| Part | Users | Announcements |
| --- | --- | --- |
| Model | `models/User.ts` (`UserModel`) | `models/Announcement.ts` (`AnnouncementModel`) |
| API controller | `ApiUserController` | `ApiAnnouncementController` |
| Web controller | `UserController` | `AnnouncementController` |
| Server actions | `app/users/actions.ts` | `app/announcements/actions.ts` |
| Views | `UserTable`, `UserDetails`, `UserForm`, `DeleteUserButton`, `UserNav` | `AnnouncementTable`, `AnnouncementDetails`, `AnnouncementForm`, `DeleteAnnouncementButton`, `AnnouncementNav` |

Both models have the same functions (`getAll`, `getById`, `create`, `update`, `replace`, `remove`) and throw the same `ValidationError`, so the controllers handle errors the same way.

---

## 🧭 All Routes

### Web pages

| URL | Method | What it shows or does |
| --- | --- | --- |
| `/` | GET | Home page with the "Explore" cards |
| `/about` | GET | About the Alumni System |
| `/users` | GET | Table of all users and the "Add a user" form |
| `/users` | POST (form) | Add a user, or delete one from a table row |
| `/users/:id` | GET | One user's details, with Edit and Delete buttons |
| `/users/:id` | POST (form) | Delete the user |
| `/users/:id/edit` | GET | Edit form filled with the user's data |
| `/users/:id/edit` | POST (form) | Save changes (only the filled-in fields change) |
| `/announcements` | GET | Table of all announcements and the "Add an announcement" form |
| `/announcements` | POST (form) | Add an announcement, or delete one from a table row |
| `/announcements/:id` | GET | One announcement's details, with Edit and Delete buttons |
| `/announcements/:id` | POST (form) | Delete the announcement |
| `/announcements/:id/edit` | GET | Edit form filled with the announcement's data |
| `/announcements/:id/edit` | POST (form) | Save changes (only the filled-in fields change) |

The `POST` rows are form submissions handled by server actions. An unknown id shows the "User not found" or "Announcement not found" page with a `404` status.

### JSON API

| Method | URL | Request body | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/users` | — | `200` array of users | — |
| POST | `/api/users` | `fullName`, `email`, `age` (required), `school` (optional) | `201` new user | `400` invalid data, `415` unsupported Content-Type |
| GET | `/api/users/:id` | — | `200` user | `404` not found |
| PUT | `/api/users/:id` | `fullName`, `email`, `age`, `school` (all required) | `200` updated user | `400`, `404`, `415` |
| PATCH | `/api/users/:id` | Any of `fullName`, `email`, `age`, `school` (at least one) | `200` updated user | `400`, `404`, `415` |
| DELETE | `/api/users/:id` | — | `204` no body | `404` not found |
| GET | `/api/announcements` | — | `200` array of announcements | — |
| POST | `/api/announcements` | `title`, `content` (required), `author` (optional) | `201` new announcement | `400` invalid data, `415` unsupported Content-Type |
| GET | `/api/announcements/:id` | — | `200` announcement | `404` not found |
| PUT | `/api/announcements/:id` | `title`, `content` (required), `author` (optional; removed if not sent) | `200` updated announcement | `400`, `404`, `415` |
| PATCH | `/api/announcements/:id` | Any of `title`, `content`, `author` (at least one) | `200` updated announcement | `400`, `404`, `415` |
| DELETE | `/api/announcements/:id` | — | `204` no body | `404` not found |

An announcement's `createdAt` is always set by the server, and a `createdAt` sent in the body is ignored.

POST, PUT and PATCH accept `application/json`, `multipart/form-data` and `application/x-www-form-urlencoded`. An `id` sent in the body is always ignored: new ids are generated, and other ids come from the URL. Errors come back as `{ "error": "..." }`, with a `field` when one field is to blame.

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

Swagger groups the routes into six tags:

- **Users:** the JSON API. Each operation shows its request body (as JSON or form-data), its response codes and examples. Use **Try it out** to send real requests from the browser.
- **Users (views):** the `/users` HTML pages and their forms. The form submissions are server actions, so they are documented but can't be sent with Try it out.
- **Announcements:** the announcements JSON API, documented the same way as Users.
- **Announcements (views):** the `/announcements` HTML pages and their forms.
- **Health:** `/api/health`.
- **Examples:** `/hello`, `/hello/{name}` and `/sum/{number1}/{number2}`.

---

## ⚠️ Current Limitations

- **No database yet.** Users and announcements are kept in memory, so all changes are lost when the server restarts, and every start begins with the same sample data (3 users and 3 announcements).
- **No login.** Authentication is deferred, so anyone who can open the site can create, edit and delete users, on the pages and through the API.
- **The edit form can't clear a field.** Empty fields keep their old value, so `school` can't be removed from the web form. A `PUT` through the API replaces the whole user.
- **No search, sorting or paging** on the users list.
- **No automated tests yet.** Routes have been checked by hand, with curl, Postman and Swagger.

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
| http://localhost:3000/announcements | Announcements pages: list, create, view, edit, delete |
| http://localhost:3000/api/announcements | The announcements as JSON |
| http://localhost:3000/api/swagger | Swagger API documentation |
| http://localhost:3000/api/health | Health check |

To try the API from a terminal, create a user with curl:

```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Zeynep Arslan","email":"zeynep.arslan@example.com","age":23,"school":"Istanbul University"}'
```

A successful request returns `201 Created` with the new user.

### Running with Docker

With Docker Desktop running, build and start the app in a container:

```bash
docker compose up --build
```

Then open http://localhost:3000 (the same URLs as above work). To stop and remove the container:

```bash
docker compose down
```

The image is a multi-stage build on `node:24-alpine` that runs the Next.js standalone server as the non-root `node` user (see `Dockerfile` and `docker-compose.yml`).

### Forgetting test

1. Start the app with `docker compose up -d --build` and check that `/api/announcements` has the 3 sample announcements.
2. Create a record: `curl -X POST http://localhost:3000/api/announcements -H "Content-Type: application/json" -d '{"title":"Forgetting test","content":"Do I survive a restart?"}'` (returns `201`).
3. Check `/api/announcements` again: there are now 4 announcements.
4. Run `docker compose down`, then `docker compose up -d`.
5. Check `/api/announcements` once more.

**Result:** the "Forgetting test" announcement was gone, and only the 3 sample announcements were left. The same happened with a user created through `/api/users`: 4 users before the restart, 3 after.

**Why:** the data lives only in the app's memory inside the container, and that memory is erased when the container stops. A database with a Docker volume will be added later so data survives restarts.

---

## 🏫 Course Information

- **Course:** Web Programming
- **Department:** Management Information Systems, Istanbul University
- **Student:** Anberin Ahmadi
- **Evaluation:** The instructor will select the student project that best demonstrates a working website to actually implement and use as the department's official alumni tracking platform.

---

## 📄 License

This project was developed for academic purposes as part of the Web Programming course at Istanbul University. It is not licensed for external use, redistribution, or commercial purposes without permission.
