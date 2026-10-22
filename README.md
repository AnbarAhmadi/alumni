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
- [x] **Week 5:** Docker setup (Dockerfile and Docker Compose), a PostgreSQL container with a persistent volume, and the data design documentation (`ddd.md`)

### Upcoming

- [ ] **Hosted database:** Supabase (hosted PostgreSQL). The app already stores users and announcements in PostgreSQL (in Docker) through Prisma; this item is about hosting it
- [ ] **Alumni status:** stored on the user as `isAlumni` (true or false, default false) and an optional `graduationYear`, shown in the existing user pages and API, with no separate alumni table (see [ddd.md](ddd.md))
- [ ] **Alumni Directory:** search graduates by year, program, company or city
- [ ] **My Profile:** graduates keep their own contact and career details up to date
- [ ] **Mentorship:** connect current students with graduates
- [ ] **Events & Reunions, Careers & Jobs, News & Success Stories, Contact** pages (shown as "Coming soon" on the home page today)
- [ ] **Authentication:** login and roles
- [ ] **Data export:** export records to CSV and Excel

---

## 🛠️ Tech Stack

| Category | Technology | Notes |
| --- | --- | --- |
| Language | TypeScript | TypeScript 7 for type checking; the TypeScript 6 API is installed alongside it because ESLint needs it |
| Framework | Next.js 16 (App Router), React 19 | Pages, API routes and server actions all live in `app/` |
| Runtime | Node.js | Developed with Node.js 24 |
| Architecture | MVC | One model, two controllers, React view components |
| Data storage | PostgreSQL, through the models (`models/User.ts` and `models/Announcement.ts`) | Data is kept when the server or the containers restart |
| Database | PostgreSQL 17 in Docker | Runs as a container with a volume; the app reads and writes it |
| Migrations | Prisma Migrate | Creates the database tables |
| ORM | Prisma Client with `@prisma/adapter-pg` | Used by the models through one shared client in `lib/prisma.ts` |
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
│   │       ├── page.tsx                  # /users/:id: one user's details, with Edit and Delete, and their job postings
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
│   │   │       ├── route.ts              # GET, PUT, PATCH and DELETE /api/users/:id → ApiUserController
│   │   │       ├── jobs/
│   │   │       │   └── route.ts          # GET and POST /api/users/:id/jobs → ApiUserJobController
│   │   │       └── applications/
│   │   │           └── route.ts          # GET /api/users/:id/applications → ApiApplicationController
│   │   ├── jobs/
│   │   │   └── [id]/
│   │   │       └── applications/
│   │   │           └── route.ts          # GET and POST /api/jobs/:id/applications → ApiApplicationController
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
│   ├── User.ts                           # User type, validation, UserModel CRUD on the users table (Prisma)
│   ├── Announcement.ts                   # Announcement type, validation, AnnouncementModel CRUD on the announcements table (Prisma)
│   ├── JobPosting.ts                     # JobPosting type, validation, JobPostingModel CRUD on job_postings (used by /api/users/:id/jobs)
│   └── Application.ts                    # Application type, validation, ApplicationModel CRUD on applications (used by the application endpoints)
├── controllers/                          # CONTROLLERS
│   ├── ApiUserController.ts              # For /api/users: calls UserModel and returns JSON with status codes
│   ├── ApiUserJobController.ts           # For /api/users/:id/jobs: a user's job postings (JobPostingModel), JSON with status codes
│   ├── ApiApplicationController.ts       # For /api/jobs/:id/applications and /api/users/:id/applications (409 for a repeat)
│   ├── UserController.ts                 # For /users: calls UserModel and returns { ok, data, error, field }
│   ├── ApiAnnouncementController.ts      # For /api/announcements: calls AnnouncementModel and returns JSON with status codes
│   └── AnnouncementController.ts         # For /announcements: calls AnnouncementModel and returns { ok, data, error, field }
├── components/                           # VIEWS (React components)
│   ├── UserTable.tsx                     # Table of users with View, Edit and Delete; "Added <name>" notice
│   ├── UserDetails.tsx                   # One user as label/value rows
│   ├── UserForm.tsx                      # Create and edit form; shows errors under the right field (client component)
│   ├── DeleteUserButton.tsx              # Delete button that asks "Delete <name>?" first (client component)
│   ├── UserNav.tsx                       # Links: All users, Details, Edit, + New user
│   ├── JobPostingTable.tsx               # A user's job postings (title, company, city), or "No job postings yet."
│   ├── AnnouncementTable.tsx             # Table of announcements with View, Edit and Delete; "Added" notice
│   ├── AnnouncementDetails.tsx           # One announcement as label/value rows; formats the createdAt date
│   ├── AnnouncementForm.tsx              # Create and edit form with a content box; errors under the right field (client component)
│   ├── DeleteAnnouncementButton.tsx      # Reuses DeleteUserButton with the announcement title in the confirmation
│   └── AnnouncementNav.tsx               # Links: All announcements, Details, Edit, + New announcement
├── lib/                                  # Helpers shared by the controllers and models
│   ├── parseBody.ts                      # Reads JSON, multipart/form-data and urlencoded bodies; turns age and ids into numbers
│   └── prisma.ts                         # The one shared Prisma Client (pg adapter), reused across hot reloads
├── prisma/                               # Database structure (Prisma Migrate) and the development seed
│   ├── schema.prisma                     # The four tables (users, announcements, job_postings, applications), following ddd.md
│   ├── seed.mts                          # Development seed: fake users, announcements, job postings and applications
│   ├── factories/                        # One Faker factory per table (fixed seed, so every run is the same)
│   │   ├── userFactory.mts               # Fake users
│   │   ├── announcementFactory.mts       # Fake announcements
│   │   ├── jobPostingFactory.mts         # Fake job postings (2 or 3 per user given)
│   │   └── applicationFactory.mts        # Fake applications (different user/posting pairs)
│   └── migrations/                       # SQL migrations created by npx prisma migrate dev
│       ├── 20261021215739_init/
│       │   └── migration.sql             # First migration: creates the users and announcements tables
│       ├── 20261021223924_add_job_postings_applications/
│       │   └── migration.sql             # Second migration: creates job_postings and applications with their foreign keys
│       └── migration_lock.toml           # Records the database provider (postgresql); written by Prisma
├── prisma.config.ts                      # Prisma CLI settings: schema and migrations paths, DATABASE_URL from .env
├── eslint.config.mjs                     # ESLint setup (Next.js recommended rules + TypeScript rules)
├── next.config.ts                        # Next.js settings (output: "standalone")
├── tsconfig.json                         # TypeScript settings; "@/..." imports start at the project root
├── package.json                          # Project name, npm scripts and dependencies
├── package-lock.json                     # Exact installed versions of the dependencies
├── .gitignore                            # Keeps node_modules, .next, .env files and local Postman files out of Git
├── Dockerfile                            # Multi-stage build of the app image (node:24-alpine, standalone server, non-root user)
├── docker-compose.yml                    # Services: web (the app) and db (PostgreSQL 17 with the postgres_data volume)
├── .dockerignore                         # Keeps node_modules, .next, .git, .env files and Postman files out of the image
├── .env.example                          # Example database settings with development defaults; copy to .env (never commit .env)
├── AGENTS.md                             # Notes for AI coding tools about this Next.js version (written by next dev)
├── CLAUDE.md                             # Points to AGENTS.md
├── ddd.md                                # Data design: data dictionary, types, validation, ER diagram, planned database
└── README.md                             # This file
```

Folders that exist on a developer's machine but are **not** committed: `node_modules/` (installed packages), `.next/` (build output) `postman/` (local Postman files) and `generated/` (the Prisma Client, made by `npx prisma generate`). The `.env` file is not committed either: it holds the real local settings, and only the template `.env.example` is in Git.

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

Both controllers reach the data only through `UserModel`, which stores it in PostgreSQL. Moving from memory to the database changed only the model files, plus `await` in the controllers, pages and server actions that call them.

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
| `/users/:id` | GET | One user's details, with Edit and Delete buttons, and a table of their job postings ("No job postings yet." if none) |
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
| POST | `/api/users` | `fullName`, `email`, `age` (required), `school` (optional) | `201` new user | `400` invalid data, `409` email already used, `415` unsupported Content-Type |
| GET | `/api/users/:id` | — | `200` user, with their job postings in a `jobs` array (`[]` if none) | `404` not found |
| PUT | `/api/users/:id` | `fullName`, `email`, `age`, `school` (all required) | `200` updated user | `400`, `404`, `409`, `415` |
| PATCH | `/api/users/:id` | Any of `fullName`, `email`, `age`, `school` (at least one) | `200` updated user | `400`, `404`, `409`, `415` |
| DELETE | `/api/users/:id` | — | `204` no body | `404` not found |
| GET | `/api/users/:id/jobs` | — | `200` array of that user's job postings | `404` user not found |
| POST | `/api/users/:id/jobs` | `title`, `company` (required), `city`, `description` (optional); the user comes from the URL, and a `userId` in the body is ignored | `201` new job posting (with `userId`) | `400` invalid data, `404` user not found, `415` unsupported Content-Type |
| GET | `/api/users/:id/applications` | — | `200` the postings the user applied to, each with `jobPosting` (`id`, `title`, `company`) | `404` user not found |
| POST | `/api/jobs/:id/applications` | `userId` (required: the applicant), `status` (optional, default `applied`); the posting comes from the URL | `201` new application | `400` missing or non-numeric `userId`, `404` posting or user not found, `409` this user already applied to this posting, `415` unsupported Content-Type |
| GET | `/api/jobs/:id/applications` | — | `200` the applications to the posting, each with `user` (`id`, `fullName`) | `404` posting not found |
| GET | `/api/announcements` | — | `200` array of announcements | — |
| POST | `/api/announcements` | `title`, `content` (required), `author` (optional) | `201` new announcement | `400` invalid data, `415` unsupported Content-Type |
| GET | `/api/announcements/:id` | — | `200` announcement | `404` not found |
| PUT | `/api/announcements/:id` | `title`, `content` (required), `author` (optional; removed if not sent) | `200` updated announcement | `400`, `404`, `415` |
| PATCH | `/api/announcements/:id` | Any of `title`, `content`, `author` (at least one) | `200` updated announcement | `400`, `404`, `415` |
| DELETE | `/api/announcements/:id` | — | `204` no body | `404` not found |

An announcement's `createdAt` is always set by the server, and a `createdAt` sent in the body is ignored.

POST, PUT and PATCH accept `application/json`, `multipart/form-data` and `application/x-www-form-urlencoded`. An `id` sent in the body is always ignored: new ids are generated, and other ids come from the URL. Errors come back as `{ "error": "..." }`, with a `field` when one field is to blame.

**Duplicate emails give `409 Conflict`.** Emails are trimmed and stored in lowercase, and the database's unique index on `email` rejects a second user with the same email. The API then answers `409` with `{ "error": "\"email\" is already used by another user.", "field": "email" }`, and the `/users` forms show the same message under the email field.

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

Swagger groups the routes into eight tags:

- **Users:** the JSON API. Each operation shows its request body (as JSON or form-data), its response codes and examples. Use **Try it out** to send real requests from the browser.
- **Job postings:** a user's job postings, `GET` and `POST /api/users/{id}/jobs`. The user comes from the URL.
- **Applications:** `POST` and `GET /api/jobs/{id}/applications` (apply, and list the applicants with their names) and `GET /api/users/{id}/applications` (the postings a user applied to).
- **Users (views):** the `/users` HTML pages and their forms. The form submissions are server actions, so they are documented but can't be sent with Try it out.
- **Announcements:** the announcements JSON API, documented the same way as Users.
- **Announcements (views):** the `/announcements` HTML pages and their forms.
- **Health:** `/api/health`.
- **Examples:** `/hello`, `/hello/{name}` and `/sum/{number1}/{number2}`.

---

## ⚠️ Current Limitations

- **The database must be running.** Users and announcements are stored in PostgreSQL, so the `db` container must be up and the migrations applied (see the Database section). Without it, the pages and the API answer with a server error. Running the seed deletes all users and announcements and inserts fake data.
- **No login.** Authentication is deferred, so anyone who can open the site can create, edit and delete users, on the pages and through the API.
- **The edit form can't clear a field.** Empty fields keep their old value, so `school` can't be removed from the web form. A `PUT` through the API replaces the whole user.
- **No search, sorting or paging** on the users list.
- **No automated tests yet.** Routes have been checked by hand, with curl, Postman and Swagger.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.9 or later (developed with Node.js 24)
- npm

The app needs the PostgreSQL database: Docker Desktop must be running, and a `.env` file is needed (`cp .env.example .env`). The **Database** section below has the full steps from zero (start `db`, run the migrations and the seed).

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

### Environment Variables

The settings for Docker Compose live in a `.env` file in the project root. Create it from the template:

```bash
cp .env.example .env
```

| Variable | What it is for | Development value in `.env.example` |
| --- | --- | --- |
| `POSTGRES_USER` | The PostgreSQL user that the `db` service creates | `alumni` |
| `POSTGRES_PASSWORD` | That user's password | `change_me` (a placeholder only; put your own secret password in `.env`) |
| `POSTGRES_DB` | The database that the `db` service creates | `alumni` |
| `DATABASE_URL` | Connection string used by Prisma on your computer (host `localhost`) to run migrations; keep it in sync with the three values above | `postgresql://alumni:change_me@localhost:5432/alumni` |

- Inside Docker, `docker-compose.yml` builds the web container's own `DATABASE_URL` (host `db`) from the three `POSTGRES_*` values; it doesn't use the one in `.env`. The app doesn't read any environment variables yet.
- **`.env` is git-ignored and must never be committed.** It is your real, local file.
- **`.env.example` is the committed template.** It contains only development values and no real secrets. When a new variable is needed, add it there with a comment.
- `docker-compose.yml` has **no default user or password**, so no password is in it. If `POSTGRES_USER` or `POSTGRES_PASSWORD` is missing, Docker Compose stops with a message such as `Set POSTGRES_PASSWORD in .env (copy .env.example to .env)`. Only `POSTGRES_DB` has a default (`alumni`).

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

#### The database service (`db`)

`docker compose up --build` (or `docker compose up -d --build` to run in the background) starts two services:

| Service | What it is |
| --- | --- |
| `web` | The Next.js app on http://localhost:3000. It starts only after `db` is healthy. |
| `db` | PostgreSQL 17.11 (`postgres:17.11-alpine`, a fixed version). Its data is stored in the Docker volume `postgres_data`. It is reachable only from this computer, at `127.0.0.1:5432`. |

The app gets a `DATABASE_URL` pointing at `db` and stores users and announcements there.

`docker compose ps` shows whether `db` is `healthy`. To open a database prompt:

```bash
docker compose exec db psql -U alumni -d alumni
```

**Credentials.** The user and password are read from `.env` only. `.env.example` has these development values:

```
POSTGRES_USER=alumni
POSTGRES_PASSWORD=change_me
POSTGRES_DB=alumni
```

Create `.env` first with `cp .env.example .env`. Without it, Docker Compose stops and asks for `POSTGRES_USER` and `POSTGRES_PASSWORD`. Change the values in `.env` if you like. `.env` files are ignored by Git (only `.env.example` is committed). **Never commit a real `.env` file or real passwords.**

**Stopping:**

| Command | Containers | Database data (`postgres_data` volume) |
| --- | --- | --- |
| `docker compose down` | Stopped and removed | **Kept**; it is there again on the next `up` |
| `docker compose down -v` | Stopped and removed | **Deleted**, along with the volume; the next `up` starts with an empty database |

### Forgetting test

1. Start the app with `docker compose up -d --build` and check that `/api/announcements` has the 3 sample announcements.
2. Create a record: `curl -X POST http://localhost:3000/api/announcements -H "Content-Type: application/json" -d '{"title":"Forgetting test","content":"Do I survive a restart?"}'` (returns `201`).
3. Check `/api/announcements` again: there are now 4 announcements.
4. Run `docker compose down`, then `docker compose up -d`.
5. Check `/api/announcements` once more.

**Result:** the "Forgetting test" announcement was gone, and only the 3 sample announcements were left. The same happened with a user created through `/api/users`: 4 users before the restart, 3 after.

**Why:** at that time (Week 5) the data lived only in the app's memory inside the container, and that memory is erased when the container stops.

**Now:** the app stores users and announcements in PostgreSQL, so the same steps keep the record. An announcement created inside Docker was still there after `docker compose down` and `docker compose up -d`, even though both containers were new.

### Persistence test

This test checks the PostgreSQL container directly, with `psql`. It doesn't go through the app.

1. Start everything with `docker compose up -d --build`, and wait until `docker compose ps` shows `db` as `healthy` and `/api/health` returns `{"status":"ok"}`.
2. Create a table and a row: `docker compose exec db psql -U alumni -d alumni -c "CREATE TABLE persistence_test (id serial PRIMARY KEY, note text); INSERT INTO persistence_test (note) VALUES ('I should survive a restart');"`
3. Check it: `docker compose exec db psql -U alumni -d alumni -c "SELECT * FROM persistence_test;"` returns 1 row, `I should survive a restart`.
4. Run `docker compose down` (without `-v`), then `docker compose up -d`, and run the `SELECT` again.
5. Run `docker compose down -v`, then `docker compose up -d`, and run the `SELECT` again.

**Result:**
- **After `down` and `up` (step 4):** the row was still there, even though the `db` container was a new one. The `postgres_data` volume was kept.
- **After `down -v` and `up` (step 5):** the table was gone (`relation "persistence_test" does not exist`), because `-v` deleted the volume that held the database files, so PostgreSQL started with an empty database.

The app's own users and announcements are stored in this database too, so they survive `docker compose down` the same way, and are deleted by `docker compose down -v`.

### Database migrations

A migration is a versioned SQL file that changes the database structure (for example, creates a table), so every copy of the database can be brought to the same structure step by step.

The tables are defined in `prisma/schema.prisma`, and Prisma Migrate turns them into SQL in `prisma/migrations/`. The first migration, `init`, creates the `users` and `announcements` tables. Prisma runs on your computer, so it needs `DATABASE_URL` in `.env` (see Environment Variables).

```bash
docker compose up -d db        # start only the database
npx prisma migrate dev         # create a migration from schema changes and apply it
npx prisma migrate status      # check that the database is up to date
```

On a fresh database (for example after `docker compose down -v`), `npx prisma migrate dev` applies the existing migrations again. To check the tables: `docker compose exec db psql -U alumni -d alumni -c "\dt"`.

**The app uses the database:** the models read and write it through the Prisma Client (`@prisma/client` with the PostgreSQL adapter `@prisma/adapter-pg`). The client is generated into `generated/prisma/` (git-ignored); `npm run dev` and `npm run build` generate it first (`predev` and `prebuild` scripts).

---

## 🗄️ Database

### Rules

1. **[ddd.md](ddd.md) is the source of truth for the database.** Its tables, fields, types and naming rules decide what the schema should be.
2. **Tables change only through migrations, never by hand.** Edit `prisma/schema.prisma` and run `npx prisma migrate dev --name <change>`, so every database gets the same change from a file in `prisma/migrations/`.
3. **`.env` never goes to GitHub.** It holds your real local settings and passwords, and Git ignores it.
4. **`.env.example` does go to GitHub.** It is the template that shows every variable, with development-only values and no real secrets.

### Run the project from zero

**Before you start:** install Node.js (20.19+, 22.12+ or 24+; Prisma needs at least these versions), make sure Docker Desktop is running, and run `npm install` in the project folder.

**1. Copy `.env.example` to `.env`.** The `-n` flag keeps an existing `.env` instead of overwriting it. On macOS, `cp -n` then exits with status 1, which is fine.

```bash
cp -n .env.example .env
```

**2. Start the database and wait until it is healthy.** Repeat `docker compose ps db` until its status shows `(healthy)`.

```bash
docker compose up -d db
docker compose ps db
```

**3. Run the migrations.** This applies every migration in `prisma/migrations/` that the database doesn't have yet. On a fresh database it creates the `users` and `announcements` tables.

```bash
npx prisma migrate deploy
```

**4. Run the seed.** First generate the Prisma Client (it is git-ignored, so a fresh clone doesn't have it). Then fill the tables with fake development data: the seed empties all four tables and inserts 20 fake users, 5 fake announcements, 2 or 3 job postings for each of the first 10 users (25 in total), and 30 applications between random users and postings (never the same pair twice), made with Faker using a fixed seed, so every run gives the same rows. Running it again never adds duplicates. It refuses to run when `NODE_ENV` is `production`. See [ddd.md](ddd.md).

```bash
npx prisma generate
npx prisma db seed
```

**5. Start the app** at http://localhost:3000. The pages and the API read and write the database, so `/users` shows the 20 seeded users and `/announcements` the 5 seeded announcements.

```bash
npm run dev
```

### Throw the container away

What happens to the data when the database container is removed (tested on seed data only):

| Step | Command | Users seen | Why |
| --- | --- | --- | --- |
| 1 | `docker compose down`, then `docker compose up -d db` | **20** | `down` removes the containers but keeps the `postgres_data` volume, so the new `db` container finds the same data. |
| 2 | `docker compose down -v`, then `docker compose up -d db` | **none:** `relation "users" does not exist` | `-v` also deletes the volume, so PostgreSQL starts with a brand-new, empty database without any tables. |
| 3 | `npx prisma migrate deploy`, then `npx prisma db seed` | **20** (and 5 announcements) | The migration rebuilds the tables, and the seed fills them with the same fake rows again (Faker uses a fixed seed). |

So the data lives in the volume, not in the container. Only use `docker compose down -v` when you really want to delete the data; afterwards run the migrations and the seed to rebuild it.

---

## 🏫 Course Information

- **Course:** Web Programming
- **Department:** Management Information Systems, Istanbul University
- **Student:** Anberin Ahmadi
- **Evaluation:** The instructor will select the student project that best demonstrates a working website to actually implement and use as the department's official alumni tracking platform.

---

## 📄 License

This project was developed for academic purposes as part of the Web Programming course at Istanbul University. It is not licensed for external use, redistribution, or commercial purposes without permission.
