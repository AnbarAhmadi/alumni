# Homecoming

**Management Information Systems Department — Istanbul University**

> **Where our graduates are now.** Homecoming is the alumni tracking system of the department: a full-stack web platform that keeps the university connected to its graduates, built from scratch as a semester-long project for the Web Programming course.

Data design: see [ddd.md](ddd.md)

---

## 📖 About

Homecoming, the web-based alumni tracking system, is a centralized platform built to strengthen the connection between Istanbul University and its graduates, since universities frequently lose contact with students after graduation. It aims to replace scattered, department-by-department record-keeping with one central database, keep alumni information current through user-driven profile updates, and help current students and graduates connect for mentorship and professional networking.

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
- [x] **Week 6:** Job postings and applications: two new tables (migration and seed), their API (`/api/users/:id/jobs`, `/api/jobs/:id/applications`, `/api/users/:id/applications`) and a user's job postings on the `/users/:id` page
- [x] **Week 7:** Validation rules for job postings (title required, at most 120 characters), a request logger (`withLogger`), one JSON 404 shape with a reason for the whole API (with a catch-all route), a safe `500` answer for unexpected errors, an error log file (`logs/error.log`) and one generic 404 page for the website
- [x] **Week 9:** A design system and a new look under the name **Homecoming**: a brand kit ([BRAND.md](BRAND.md)) and design rules ([DESIGN.md](DESIGN.md)), one stylesheet built from CSS variables, one shared layout, a livelier homepage with real numbers and the latest announcements and job postings, redesigned users, announcements and About pages, designed 404 and 500 pages, subtle motion (off for `prefers-reduced-motion`), and one of each component (card, button hover, link, table, form, empty state)
- [x] **Week 10:** Roles and register: a `role` for every user (`ADMIN`, `ALUMNI`, `STUDENT`) and a `passwordHash` (bcrypt, through `bcryptjs`) in a new migration; a `/register` page (in the shared layout, with a "Register" link in the navigation) and `POST /api/register`, both following the register rules in [ddd.md](ddd.md); the password hash is never returned, shown or logged. The role permissions come later (see Upcoming)
- [x] **Week 10:** Login and logout: a `sessions` table (new migration) holding only the SHA-256 hash of each session token; a `/login` page; a "Log out" button in the header, which shows "Log in" and "Register" or the logged-in user's name; and `POST /api/login`, `POST /api/logout` and `GET /api/me`. Sessions last 7 days in an `httpOnly` cookie, and an unknown email and a wrong password get the same answer ("Email or password is wrong.")

- [x] **Week 10:** Access rules: every page, form and API endpoint is public, logged in, owner or admin, or admin only, from one rules map (`lib/access.ts`) and one guard (`lib/guard.ts`: `withAuth` for the API, `guardPage` for pages, `guardForm` for server actions; `proxy.ts` sends visitors without a cookie to `/login?next=...` with `303`); a designed 403 page; `401`/`403` JSON for the API; applying always uses the session user; registering logs you in; buttons you may not use are hidden. See Access rules below and in [ddd.md](ddd.md)
- [x] **Week 10:** Admin panel, part 1: `/admin` (a dashboard with users by role and the counts) and `/admin/users` (change a role, edit, delete), admin only, with an "Admin" link in the header for admins; `PATCH /api/users/:id/role`; safety rules in the model (an admin can't delete themselves, the last admin can't be demoted or deleted); `npm run make-admin -- <email>`, and the seed no longer creates an admin
- [x] **Week 10:** Admin panel, part 2: `/admin/announcements` (create, edit, delete), `/admin/jobs` (every posting with its owner; create for a chosen owner, edit, delete) and `/admin/applications` (applicant, posting, status; change the status to applied, reviewed, hired or rejected, anything else is refused; delete), admin only, linked from the cards on `/admin`
- [x] **Week 10:** Navigation by role: one menu list (`lib/navigation.ts`) built from the access rules, so the header shows only pages you may open (logged out: Home, About, Announcements, Log in, Register; logged in: also Users, My profile, your name with a role label and Log out; admins also Admin), with the current page marked (`aria-current="page"`). See Navigation in [ddd.md](ddd.md)
- [x] **Week 10:** My pages: `/me` (My profile: your details with a role label, an edit form for full name, school and graduation year, and Change password, which logs out your other devices) and `/me/applications` (your applications with title, company, status and date, Withdraw, or "No applications yet."), always for the logged-in user only; the menu's "My profile" now links to `/me`, next to "My applications"
- [x] **Week 10:** Jobs: `/jobs` (logged in, "Jobs" in the menu) lists every job posting, newest first, with title, company, city and who posted it, and an Apply button, or a disabled "Applied" once you applied; applying is always as the logged-in user with status `applied`, a second application to the same posting is refused, and "No postings yet." when there are none

### Upcoming

- [ ] **Hosted database:** Supabase (hosted PostgreSQL). The app already stores users and announcements in PostgreSQL (in Docker) through Prisma; this item is about hosting it
- [ ] **Alumni status:** stored on the user as `isAlumni` (true or false, default false) and an optional `graduationYear`, shown in the existing user pages and API, with no separate alumni table (see [ddd.md](ddd.md))
- [ ] **Alumni Directory:** search graduates by year, program, company or city
- [ ] **My Profile:** graduates keep their own contact and career details up to date
- [ ] **Mentorship:** connect current students with graduates
- [ ] **Events & Reunions, Careers & Jobs, News & Success Stories, Contact** pages (shown as "Coming soon" on the home page today)
- [ ] **Accounts:** rate limiting of login attempts, email verification and password reset
- [ ] **Data export:** export records to CSV and Excel

---

## 🛠️ Tech Stack

| Category | Technology | Notes |
| --- | --- | --- |
| Language | TypeScript | TypeScript 7 for type checking; the TypeScript 6 API is installed alongside it because ESLint needs it |
| Framework | Next.js 16 (App Router), React 19 | Pages, API routes and server actions all live in `app/` |
| Runtime | Node.js | Developed with Node.js 24 |
| Architecture | MVC | Models in `models/`, API and web controllers in `controllers/`, React view components in `components/` |
| Data storage | PostgreSQL, through the four models (`models/User.ts`, `Announcement.ts`, `JobPosting.ts`, `Application.ts`) | Data is kept when the server or the containers restart |
| Database | PostgreSQL 17 in Docker | Runs as a container with a volume; the app reads and writes it |
| Migrations | Prisma Migrate | Creates the database tables |
| ORM | Prisma Client with `@prisma/adapter-pg` | Used by the models through one shared client in `lib/prisma.ts` |
| Logging and errors | `lib/withLogger.ts` and `lib/notFound.ts` (Week 7) | One log line per API request, one JSON 404 shape, a safe `500` answer and `logs/error.log`; password hashes are redacted from every log (`lib/redact.ts`, Week 10) |
| Password hashing | `bcryptjs` (Week 10) | Pure JavaScript bcrypt (no native build), cost 10; only the hash is stored |
| Sessions | `lib/session.ts`, `models/Session.ts` (Week 10) | No extra service: a `sessions` table and an `httpOnly` cookie; the token is 32 random bytes and only its SHA-256 hash is stored (`node:crypto`) |
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
│   ├── layout.tsx                        # The one layout: "Homecoming" wordmark, navigation, one centred column, footer; loads the fonts; reads the logged-in user for the header
│   ├── page.tsx                          # Home page (/): hero band, real counts (count up once), the 3 newest announcements and job postings, "Coming soon"
│   ├── forbidden.tsx                     # The 403 page (Week 10): "Your account can't open this page.", shown by the access guard
│   ├── not-found.tsx                     # The one 404 page of the website: unknown URLs (/banana) and unknown ids (/users/9999) (Week 7, designed in Week 9)
│   ├── error.tsx                         # The 500 page of the website (inside the layout): "Something went wrong on our side.", Try again (Week 9)
│   ├── global-error.tsx                  # The 500 page used only if the root layout itself fails; brings its own <html>, styles and fonts (Week 9)
│   ├── globals.css                       # The one stylesheet, built from the DESIGN.md variables (colours, fonts, spacing, radius)
│   ├── admin/                            # The admin panel (Week 10), admin only
│   │   ├── page.tsx                      # /admin: the dashboard (users by role, counts, sections)
│   │   └── users/
│   │       ├── page.tsx                  # /admin/users: users with role dropdown, Edit, Delete and the safety-rule messages
│   │       └── actions.ts                # Server actions: changeRoleAction, adminDeleteUserAction (guardForm)
│   ├── about/
│   │   └── page.tsx                      # About page (/about): what the system is for
│   ├── login/                            # The login page (Week 10)
│   │   ├── page.tsx                      # /login: "Log in" with the login form
│   │   └── actions.ts                    # Server actions: loginAction (303 to /) and logoutAction (the header's Log out button)
│   ├── register/                         # The register page (Week 10)
│   │   ├── page.tsx                      # /register: "Create an account" with the register form
│   │   └── actions.ts                    # Server action: UserController.register, then 303 to /users/:id

│   ├── users/                            # The users web pages (HTML)
│   │   ├── page.tsx                      # /users: users table and the "Add a user" form
│   │   ├── actions.ts                    # Server actions for the forms: create, update and delete
│   │   └── [id]/                         # [id] is the user's id from the URL
│   │       ├── page.tsx                  # /users/:id: one user's details, with Edit and Delete, and their job postings
│   │       └── edit/
│   │           └── page.tsx              # /users/:id/edit: the edit form, filled with the user's data
│   ├── announcements/                    # The announcements web pages (HTML)
│   │   ├── page.tsx                      # /announcements: announcements table and the "Add an announcement" form
│   │   ├── actions.ts                    # Server actions for the forms: create, update and delete
│   │   └── [id]/                         # [id] is the announcement's id from the URL
│   │       ├── page.tsx                  # /announcements/:id: one announcement's details, with Edit and Delete
│   │       └── edit/
│   │           └── page.tsx              # /announcements/:id/edit: the edit form, filled with the current values
│   ├── api/                              # JSON API routes
│   │   ├── [[...slug]]/
│   │   │   └── route.ts                  # Any unknown /api path, any method: 404 { "error": "Not found", "reason": "No route GET /api/..." } (Week 7)
│   │   ├── health/
│   │   │   └── route.ts                  # GET /api/health: says the server is running
│   │   ├── register/
│   │   │   └── route.ts                  # POST /api/register → ApiUserController.register (Week 10)
│   │   ├── login/
│   │   │   └── route.ts                  # POST /api/login → ApiAuthController.login (Week 10)
│   │   ├── logout/
│   │   │   └── route.ts                  # POST /api/logout → ApiAuthController.logout (Week 10)
│   │   ├── me/
│   │   │   └── route.ts                  # GET /api/me → ApiAuthController.me (Week 10)
│   │   ├── users/
│   │   │   ├── route.ts                  # GET and POST /api/users → ApiUserController
│   │   │   └── [id]/
│   │   │       ├── route.ts              # GET, PUT, PATCH and DELETE /api/users/:id → ApiUserController
│   │   │       ├── jobs/
│   │   │       │   └── route.ts          # GET and POST /api/users/:id/jobs → ApiUserJobController
│   │   │       └── applications/
│   │   │           └── route.ts          # GET /api/users/:id/applications → ApiApplicationController
│   │   ├── applications/
│   │   │   └── [id]/
│   │   │       └── route.ts              # PATCH /api/applications/:id: change the status (posting owner or admin) (Week 10)
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
│   ├── User.ts                           # User type, validation, UserModel CRUD on the users table (Prisma), and register (Week 10)
│   ├── Announcement.ts                   # Announcement type, validation, AnnouncementModel CRUD on the announcements table (Prisma)
│   ├── JobPosting.ts                     # JobPosting type, validation, JobPostingModel CRUD on job_postings (used by /api/users/:id/jobs)
│   ├── Session.ts                        # SessionModel: create, find by token hash and delete sessions rows (Week 10)
│   └── Application.ts                    # Application type, validation, ApplicationModel CRUD on applications (used by the application endpoints)
├── controllers/                          # CONTROLLERS
│   ├── ApiAuthController.ts              # For /api/login, /api/logout and /api/me: JSON with 200, 204, 400 and 401 (Week 10)
│   ├── AuthController.ts                 # For the /login form, the Log out button and the header's current user (Week 10)
│   ├── ApiUserController.ts              # For /api/users: calls UserModel and returns JSON with status codes
│   ├── ApiUserJobController.ts           # For /api/users/:id/jobs: a user's job postings (JobPostingModel), JSON with status codes
│   ├── ApiApplicationController.ts       # For /api/jobs/:id/applications and /api/users/:id/applications (409 for a repeat)
│   ├── UserController.ts                 # For the /users forms and the edit page: calls UserModel and returns { ok, data, error, field }
│   ├── ApiAnnouncementController.ts      # For /api/announcements: calls AnnouncementModel and returns JSON with status codes
│   ├── AdminController.ts                # For /admin and /admin/users: counts, users with roles, change role, delete (Week 10)
│   ├── AnnouncementController.ts         # For /announcements: calls AnnouncementModel and returns { ok, data, error, field }
│   ├── HomeController.ts                 # For /: read-only counts and the newest announcements and job postings (Week 9)
│   └── UserDirectoryController.ts        # For /users and /users/:id: read-only users with their alumni status (Week 9)
├── components/                           # VIEWS (React components)
│   ├── UserTable.tsx                     # Table of users: name (link), email, school, alumni badge, graduation year, Edit, Delete
│   ├── UserDetails.tsx                   # Profile header: initials avatar, name, alumni badge, email, school, graduation year
│   ├── UserForm.tsx                      # Create and edit form; shows errors under the right field (client component)
│   ├── LoginForm.tsx                     # The login form: email kept on an error, the generic error under the form (client component, Week 10)
│   ├── RegisterForm.tsx                  # The register form: every error under its field, graduation year only for Alumni (client component, Week 10)
│   ├── DeleteUserButton.tsx              # Delete button that asks "Delete <name>?" first (client component)
│   ├── StatusPage.tsx                    # The shared look of the 404 and 500 pages: large serif code, one line, buttons
│   ├── EmptyState.tsx                    # The one empty state: a dashed frame, one sentence, an optional button
│   ├── CountUp.tsx                       # The homepage numbers: count up once (client component; the final number works without JS)
│   ├── SiteHeader.tsx                    # The header: the "Homecoming" wordmark and the navigation (layout and global-error)
│   ├── SiteFooter.tsx                    # The footer (layout and global-error)
│   ├── friendlyError.ts                  # Turns model messages into plain form messages ("fullName" is required. -> Full name is required.)
│   ├── JobPostingTable.tsx               # A user's job postings (title, company, city), or "No postings yet."
│   ├── AdminUserTable.tsx                # The /admin/users table: role dropdown with Save, Edit, Delete (Week 10)
│   ├── AnnouncementList.tsx              # Announcements as cards, newest first: date badge, title, 2-line preview, Read more, Edit, Delete
│   ├── AnnouncementDetails.tsx           # One announcement's date and full message; formats the createdAt date
│   ├── AnnouncementForm.tsx              # Create and edit form: labels above fields, errors under the right field (client component)
│   └── DeleteAnnouncementButton.tsx      # Reuses DeleteUserButton with the announcement title in the confirmation
├── lib/                                  # Helpers shared by the routes, controllers and models
│   ├── access.ts                         # THE access rules map (Week 10): one rule per page, form and endpoint, decide(), can(), safeNext()
│   ├── guard.ts                          # The access guard (Week 10): withAuth (API), guardPage (pages), guardForm (server actions)
│   ├── sessionCookie.ts                  # The session cookie's name, shared by lib/session.ts and proxy.ts (Week 10)
│   ├── notFound.ts                       # The one JSON 404 answer of the API: { "error": "Not found", "reason": "..." } (Week 7)
│   ├── parseBody.ts                      # Reads JSON, multipart/form-data and urlencoded bodies; turns age and ids into numbers
│   ├── prisma.ts                         # The one shared Prisma Client (pg adapter), reused across hot reloads
│   ├── redact.ts                         # Replaces bcrypt hashes with [redacted] in errors and logs (Week 10)
│   ├── session.ts                        # createSession, getCurrentUser, destroySession: the session cookie and token (Week 10)
│   └── withLogger.ts                     # Wraps every /api route handler: one log line per request, safe 500 answer, logs/error.log (Week 7)
├── scripts/
│   └── make-admin.mts                    # npm run make-admin -- <email>: makes a registered user an ADMIN (Week 10)
├── prisma/                               # Database structure (Prisma Migrate) and the development seed
│   ├── schema.prisma                     # The five tables (users, announcements, job_postings, applications, sessions) and the Role enum, following ddd.md
│   ├── seed.mts                          # Development seed: fake users, announcements, job postings and applications
│   ├── factories/                        # One Faker factory per table (fixed seed, so every run is the same)
│   │   ├── userFactory.mts               # Fake users, with a role and the demo-only password hash
│   │   ├── announcementFactory.mts       # Fake announcements
│   │   ├── jobPostingFactory.mts         # Fake job postings (2 or 3 per user given)
│   │   └── applicationFactory.mts        # Fake applications (different user/posting pairs)
│   └── migrations/                       # SQL migrations created by npx prisma migrate dev
│       ├── 20261021215739_init/
│       │   └── migration.sql             # First migration: creates the users and announcements tables
│       ├── 20261021223924_add_job_postings_applications/
│       │   └── migration.sql             # Second migration: creates job_postings and applications with their foreign keys
│       ├── 20261125065612_add_user_roles_and_passwords/
│       │   └── migration.sql             # Third migration (Week 10): Role enum, users.role and users.passwordHash, optional age; fills in existing users
│       ├── 20261125071955_add_sessions/
│       │   └── migration.sql             # Fourth migration (Week 10): the sessions table, with its foreign key to users
│       └── migration_lock.toml           # Records the database provider (postgresql); written by Prisma
├── proxy.ts                              # Runs before pages (Week 10): no session cookie on a protected page -> 303 to /login?next=...
├── prisma.config.ts                      # Prisma CLI settings: schema and migrations paths, DATABASE_URL from .env
├── eslint.config.mjs                     # ESLint setup (Next.js recommended rules + TypeScript rules)
├── next.config.ts                        # Next.js settings (output: "standalone"; experimental.authInterrupts for forbidden(), Week 10)
├── tsconfig.json                         # TypeScript settings; "@/..." imports start at the project root
├── package.json                          # Project name, npm scripts and dependencies
├── package-lock.json                     # Exact installed versions of the dependencies
├── .gitignore                            # Keeps node_modules, .next, generated/, logs/, .env files and local Postman files out of Git
├── Dockerfile                            # Multi-stage build of the app image (node:24-alpine, standalone server, non-root user)
├── docker-compose.yml                    # Services: web (the app) and db (PostgreSQL 17 with the postgres_data volume)
├── .dockerignore                         # Keeps node_modules, .next, .git, .env files and Postman files out of the image
├── .env.example                          # Example database settings with development defaults; copy to .env (never commit .env)
├── AGENTS.md                             # Notes for AI coding tools about this Next.js version (written by next dev)
├── CLAUDE.md                             # Points to AGENTS.md
├── ddd.md                                # Data design: data dictionary, types, validation, ER diagram, planned database
├── BRAND.md                              # Brand kit (Week 9): name, colours, type, shape, voice and wordmark
├── DESIGN.md                             # Design rules (Week 9): references, CSS variables and page rules, based on BRAND.md
├── docs/
│   └── design/                           # Screenshots of the site's design
│       ├── before-users.png              # /users before the Week 9 design change
│       ├── before-user.png               # /users/1 before the Week 9 design change
│       ├── after-home.png                # The new homepage, with the hero band and the real numbers (Week 9)
│       ├── after-announcements.png       # The new /announcements list (Week 9)
│       ├── after-announcement.png        # The new announcement page, /announcements/:id (Week 9)
│       ├── after-users.png               # The new /users table (Week 9)
│       ├── after-user.png                # The new profile page, /users/:id (Week 9)
│       ├── after-404.png                 # The new 404 page, /banana (Week 9)
│       └── after-500.png                 # The new 500 page, /users with the database stopped (Week 9)
└── README.md                             # This file
```

Folders that exist on a developer's machine but are **not** committed: `node_modules/` (installed packages), `.next/` (build output), `postman/` (local Postman files), `generated/` (the Prisma Client, made by `npx prisma generate`) and `logs/` (`error.log`, written by the app when an unexpected error happens). The `.env` file is not committed either: it holds the real local settings, and only the template `.env.example` is in Git.

---

## 🏗️ MVC Architecture

The app follows **MVC (Model–View–Controller)**. Each part has one job:

| Part | Job in this app | Where |
| --- | --- | --- |
| **Model** | Holds the users, checks the data is valid, and does create, read, update and delete. It has no HTTP or React code. | `models/User.ts` (`UserModel`) |
| **View** | Shows data on the screen. The components only display what they are given and never touch the model. | `components/` |
| **Controller** | Sits in the middle: takes the request, calls the model, and decides what to send back. | `controllers/` |

In Next.js the `app/` folder is the router: where a file is decides its URL. The route and page files are kept thin, so they only pass the request to a controller. The small routes with no data (`/api/health`, `/api/swagger`, `/hello`, `/sum`) answer directly. Every handler under `app/api/` is wrapped with `withLogger` (Week 7), which logs the request and turns an unexpected error into a safe `500` (see Logging and Error Handling).

Users have **three controllers** for the **same model**, because the clients need different answers:

- **`ApiUserController`** is for programs (curl, Postman, Swagger). It returns JSON with HTTP status codes (`200`, `201`, `204`, `400`, `404`, `409`, `415`); an unexpected error becomes `500` in `withLogger`. It also answers `POST /api/register` (Week 10).
- **`UserController`** is for the web forms (create, edit, delete, and register since Week 10) and the edit page. It returns a result object `{ ok, data, error, field }` (register adds `errors`, every invalid field), and the page decides which view to show. Register on the page and on the API call the same model function, `UserModel.register`.
- **`UserDirectoryController`** (Week 9) only reads: the `/users` table and the `/users/:id` profile, with the alumni status. `HomeController` does the same for the homepage numbers and latest items.

All of them reach the data only through `UserModel`, which stores it in PostgreSQL. Moving from memory to the database changed only the model files, plus `await` in the controllers, pages and server actions that call them.

### Example: how a request travels through MVC

`POST /api/users` with a JSON body:

1. **Route** (`app/api/users/route.ts`) receives the request and passes it to the controller. The handler is wrapped with `withLogger`.
2. **Controller** (`ApiUserController.create`) reads the body with `parseBody` and calls the model.
3. **Model** (`UserModel.create`) validates the data, saves the user and returns it.
4. **Response:** the controller sends `201 Created` with the new user, `400` with the field name if validation fails, or `409` if the email is already used.
5. **Log:** `withLogger` writes one line such as `10:20:30 POST /api/users 201 18 ms` to the terminal. If anything on the way throws (for example the database is down), it answers `500` `{ "error": "Internal server error" }` instead and writes the error to `logs/error.log`.

The `/users` web form follows the same path, except a server action (`createUserAction`) and `UserController` replace the route and `ApiUserController`, and the result is shown by `UserForm` and `UserTable`.

### Announcements use the same pattern

Announcements (`title`, `content`, optional `author`, and a `createdAt` date set by the server) are built exactly like users, with one model and two controllers:

| Part | Users | Announcements |
| --- | --- | --- |
| Model | `models/User.ts` (`UserModel`) | `models/Announcement.ts` (`AnnouncementModel`) |
| API controller | `ApiUserController` | `ApiAnnouncementController` |
| Web controller | `UserController` (forms, edit page), `UserDirectoryController` (list, profile; read-only) | `AnnouncementController` |
| Server actions | `app/users/actions.ts` | `app/announcements/actions.ts` |
| Views | `UserTable`, `UserDetails`, `UserForm`, `DeleteUserButton`, `JobPostingTable` | `AnnouncementList`, `AnnouncementDetails`, `AnnouncementForm`, `DeleteAnnouncementButton` |

Both models have the same CRUD functions (`getAll`, `getById`, `create`, `update`, `replace`, `remove`) and throw the same `ValidationError`, so the controllers handle errors the same way. Week 9 added read-only functions for the pages: `count` (users, announcements, job postings), `getLatest` (announcements, job postings), and `getAllWithStatus` and `getProfile` (users with their alumni status).

---

## 🧭 All Routes

### Web pages

| URL | Method | What it shows or does |
| --- | --- | --- |
| `/` | GET | Home page: a hero band, the number of users, announcements and job postings (read from the database), the 3 newest announcements and job postings, and a "Coming soon" line. If the database can't be reached, it still shows, with a short message instead of the numbers |
| `/about` | GET | About Homecoming: why it exists, what you can do today, what comes next |
| `/register` | GET | "Create an account" (Week 10): full name, email, password, confirm password, Alumni or Student, graduation year (shown only for Alumni) and an optional school |
| `/register` | POST (form) | Register. On success, the new user is logged in (Week 10) and gets a `303` redirect to their page `/users/:id`. On an error, the same form again with what was typed (except the passwords) and each error under its field, in `--color-danger`; a taken email shows "An account with this email already exists." |
| `/login` | GET | "Log in" (Week 10): email and password, and a link to `/register` |
| `/login` | POST (form) | Log in. On success, the session cookie and a `303` redirect to the home page. On a failure, the same form with the email kept (never the password) and "Email or password is wrong." in `--color-danger`, or "Email is required." / "Password is required." under the missing field |
| Any page | POST (form) | The header's "Log out" button (only when logged in): deletes the session, clears the cookie and redirects (`303`) to the home page. Logged out, the header shows "Log in" and "Register"; logged in, the user's name (a link to their page) and "Log out" |
| `/users` | GET | Table of all users (name, email, school, alumni badge, graduation year) , a count line ("20 users, 12 of them alumni."), and the "Add a user" form; "No users yet. Add the first one." when there are none |
| `/users` | POST (form) | Add a user, or delete one from a table row |
| `/users/:id` | GET | The user's profile (initials avatar, name, email, school, graduation year) with Edit and Delete, and a table of their job postings ("No postings yet." if none) |
| `/users/:id` | POST (form) | Delete the user |
| `/users/:id/edit` | GET | Edit form filled with the user's data |
| `/users/:id/edit` | POST (form) | Save changes (only the filled-in fields change) |
| `/admin` | GET | Admin only (Week 10): the dashboard: users by role (admins, alumni, students), the number of announcements, job postings and applications, and the sections (Users; Announcements, Job postings and Applications come next) |
| `/admin/users` | GET, POST (forms) | Admin only (Week 10): every user with name, email, role, alumni and graduation year; a role dropdown with Save, Edit (`/users/:id/edit`) and Delete. A safety rule that blocks a change is shown at the top in plain words, for example "You can't delete your own admin account." |
| `/announcements` | GET | A count line ("5 announcements."), the announcements as cards, newest first (date, title, 2-line preview, Read more), and the "Post an announcement" form; "No announcements yet. Post the first one." when there are none |
| `/announcements` | POST (form) | Post an announcement, or delete one from its card |
| `/announcements/:id` | GET | One announcement: title, date and full message, a link back to the list, and Edit and Delete buttons |
| `/announcements/:id` | POST (form) | Delete the announcement |
| `/announcements/:id/edit` | GET | Edit form filled with the announcement's data |
| `/announcements/:id/edit` | POST (form) | Save changes (only the filled-in fields change) |
| Any other URL, for example `/banana` | GET | The 404 page: "404", "There is no page at this address." and a button back to the home page, with status `404` |

The `POST` rows are form submissions handled by server actions. An unknown or invalid id (`/users/9999`, `/users/abc`, also on the `/edit` pages and for announcements) and any unknown page URL (`/banana`) show the 404 page (`app/not-found.tsx`) with a `404` status and a button back to the home page. If a page fails on the server (for example the database is down), the 500 page (`app/error.tsx`) is shown instead, with status `500`. The JSON API keeps its own JSON 404 and 500.

### JSON API

| Method | URL | Request body | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/users` | — | `200` array of users | — |
| POST | `/api/users` | `fullName`, `email`, `age` (required), `school` (optional) | `201` new user | `400` invalid data, `409` email already used, `415` unsupported Content-Type |
| GET | `/api/users/:id` | — | `200` user, with their job postings in a `jobs` array (`[]` if none) | `404` not found |
| PUT | `/api/users/:id` | `fullName`, `email`, `age`, `school` (all required) | `200` updated user | `400`, `404`, `409`, `415` |
| PATCH | `/api/users/:id` | Any of `fullName`, `email`, `age`, `school` (at least one) | `200` updated user | `400`, `404`, `409`, `415` |
| DELETE | `/api/users/:id` | — | `204` no body | `404` not found, `409` a safety rule: an admin can't delete their own account, and the last admin can't be deleted (Week 10) |
| PATCH | `/api/users/:id/role` (Week 10, admin only) | `role`: `ADMIN`, `ALUMNI` or `STUDENT` | `200` the user with the new role (never a hash) | `400` missing or unknown role, `401`, `403`, `404`, `409` the last admin can't be demoted, `415` |
| POST | `/api/register` (Week 10) | `fullName`, `email`, `password` (at least 8 characters), `confirmPassword` (the same), `role` (`ALUMNI` or `STUDENT`), `graduationYear` (required for `ALUMNI`, 1950 to the current year; not allowed for `STUDENT`), `school` (optional) | `201` the new user with `role`, `isAlumni` and `graduationYear`, never the password or its hash | `400` the first invalid field (`role: "ADMIN"` too), `409` email already used, `415` unsupported Content-Type |
| POST | `/api/login` (Week 10) | `email`, `password` (both required) | `200` the user (as for register, never a hash) and a `Set-Cookie` with `homecoming_session` (`HttpOnly`, `SameSite=Lax`, `Path=/`, 7 days; `Secure` in production) | `400` a field is missing (`field`), `401` `{ "error": "Email or password is wrong." }` for an unknown email or a wrong password, `415` |
| POST | `/api/logout` (Week 10) | — (the cookie) | `204`, the session row deleted and the cookie cleared; also `204` when not logged in | — |
| GET | `/api/me` (Week 10) | — (the cookie) | `200` the logged-in user | `401` `{ "error": "Not logged in." }` without a cookie, or for an unknown or expired session (an expired one is deleted and its cookie cleared) |
| GET | `/api/users/:id/jobs` | — | `200` array of that user's job postings | `404` user not found |
| POST | `/api/users/:id/jobs` | `title` (required, at most 120 characters), `company` (required), `city`, `description` (optional); the user comes from the URL, and a `userId` in the body is ignored | `201` new job posting (with `userId`) | `400` invalid data, `404` user not found, `415` unsupported Content-Type |
| GET | `/api/users/:id/applications` | — | `200` the postings the user applied to, each with `jobPosting` (`id`, `title`, `company`) | `404` user not found |
| POST | `/api/jobs/:id/applications` | None: the body isn't read (Week 10). The applicant is always the logged-in user and the status is always `applied`; a `userId` or `status` sent is ignored. The posting comes from the URL | `201` new application | `401` not logged in, `404` posting not found, `409` this user already applied to this posting |
| PATCH | `/api/applications/:id` (Week 10) | `status` (required, not empty); a `userId` or `jobPostingId` is ignored. Only the owner of the posting or an admin, never the applicant | `200` updated application | `400` missing or empty `status`, `401`, `403`, `404` application not found, `415` |
| GET | `/api/jobs/:id/applications` | — | `200` the applications to the posting, each with `user` (`id`, `fullName`) | `404` posting not found |
| GET | `/api/announcements` | — | `200` array of announcements | — |
| POST | `/api/announcements` | `title`, `content` (required), `author` (optional) | `201` new announcement | `400` invalid data, `415` unsupported Content-Type |
| GET | `/api/announcements/:id` | — | `200` announcement | `404` not found |
| PUT | `/api/announcements/:id` | `title`, `content` (required), `author` (optional; removed if not sent) | `200` updated announcement | `400`, `404`, `415` |
| PATCH | `/api/announcements/:id` | Any of `title`, `content`, `author` (at least one) | `200` updated announcement | `400`, `404`, `415` |
| DELETE | `/api/announcements/:id` | — | `204` no body | `404` not found |
| Any | Any other path under `/api` (Week 7) | — | — | `404` `{ "error": "Not found", "reason": "No route GET /api/..." }` |

Any of these can also answer `500` `{ "error": "Internal server error" }` if something unexpected fails (see Error responses below).

An announcement's `createdAt` is always set by the server, and a `createdAt` sent in the body is ignored.

**Passwords (Week 10).** Only a bcrypt hash of a password is stored (`users.passwordHash`). No endpoint or page ever returns it, and the `/api/users` answers are exactly the same as before. Users created through `/api/users` or the `/users` form get the role `STUDENT` and the hash of a random password nobody knows. Users who registered have no `age`, so the API leaves that key out for them.

POST, PUT and PATCH accept `application/json`, `multipart/form-data` and `application/x-www-form-urlencoded`. An `id` sent in the body is always ignored: new ids are generated, and other ids come from the URL.

**Job posting rules (Week 7):** `title` is required and at most 120 characters after trimming, `company` is required, and `city` and `description` are optional (if sent, they must not be empty). A 121-character title gives `400` `{ "error": "\"title\" must be at most 120 characters.", "field": "title" }`. The limit is checked by the app only; the database column has no length limit. See [ddd.md](ddd.md).

### Error responses

| Status | When | Body |
| --- | --- | --- |
| `400` | Invalid data, or the body can't be read | `{ "error": "...", "field": "..." }` (`field` only when one field is to blame) |
| `404` | Unknown id, or unknown path under `/api` (Week 7) | Always `{ "error": "Not found", "reason": "..." }`, for example `"User 9999 does not exist"`, `"Job posting 9999 does not exist"` or `"No route GET /api/banana"` |
| `409` | The email is already used (also on register), or the user already applied to this posting | `{ "error": "...", "field": "email" }` or `{ "error": "...", "field": "jobPostingId" }` |
| `415` | Unsupported `Content-Type` on POST, PUT or PATCH | `{ "error": "Unsupported Content-Type ..." }` |
| `500` | Any unexpected error, for example the database is down (Week 7) | Always `{ "error": "Internal server error" }`: no stack trace and no internal message |

The `404` body is built once in `lib/notFound.ts`, and the `500` answer once in `lib/withLogger.ts`, so every controller and route answers the same way. A method that an existing route doesn't have (for example `DELETE /api/users`) gets Next.js's own `405` with an empty body; it is not logged.

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

Swagger groups the routes into eleven tags:

- **Users:** the JSON API. Each operation shows its request body (as JSON or form-data), its response codes and examples. Use **Try it out** to send real requests from the browser.
- **Register:** `POST /api/register` (Week 10), with an example for every `400` rule and the `409`.
- **Login:** `POST /api/login`, `POST /api/logout` and `GET /api/me` (Week 10). Try it out uses the browser's cookie, so after `POST /api/login` the other two work as that user.
- **Admin (views):** the admin panel pages `/admin` and `/admin/users` (Week 10). The role change itself is `PATCH /api/users/{id}/role` under Users.
- **Job postings:** a user's job postings, `GET` and `POST /api/users/{id}/jobs`. The user comes from the URL.
- **Applications:** `POST` and `GET /api/jobs/{id}/applications` (apply, and list the applicants with their names) and `GET /api/users/{id}/applications` (the postings a user applied to).
- **Users (views):** the `/users` HTML pages and their forms, and the `/register` page. The form submissions are server actions, so they are documented but can't be sent with Try it out.
- **Announcements:** the announcements JSON API, documented the same way as Users.
- **Announcements (views):** the `/announcements` HTML pages and their forms.
- **Health:** `/api/health`.
- **Examples:** `/hello`, `/hello/{name}` and `/sum/{number1}/{number2}`.

Every `/api` operation in Swagger also lists the shared `500` response, and its `404` examples use the `{ "error": "Not found", "reason": "..." }` shape (Week 7).

---

## 🛡️ Logging and Error Handling (Week 7)

Next.js has no `app.use()`, and `proxy.ts` runs before a route, so it never sees the final status code. Instead, every handler under `app/api/` is wrapped once with `withLogger` from `lib/withLogger.ts`, for example `export const GET = withLogger(handler)`. The controllers don't log or catch unexpected errors themselves.

**Request log.** Every `/api` request writes one line to the terminal where `npm run dev` runs (inside Docker: `docker compose logs web`):

```
10:20:30 POST /api/users 201 18 ms
```

That is the time, method, path, status code and duration. Request bodies are never logged. Prisma's error messages print a failed query's arguments, so bcrypt password hashes are replaced with `[redacted]` before an error reaches the terminal or `logs/error.log` (Week 10, `lib/redact.ts`). Error answers (`400`, `404`, `409`, `415`, `500`) are logged too. The web pages, `/hello` and `/sum` are not wrapped, so they are not logged.

**404 Guardian.** Every `404` of the API has the same body, built by `lib/notFound.ts`: `{ "error": "Not found", "reason": "User 9999 does not exist" }`. The controllers use it for unknown ids. The catch-all route `app/api/[[...slug]]/route.ts` answers any unknown path under `/api`, for every method: `GET /api/banana` → `{ "error": "Not found", "reason": "No route GET /api/banana" }`. Next.js always prefers a more specific route, so the catch-all never hides a real one.

**5xx Guardian.** If a handler throws (for example the database is down), `withLogger` answers `500` with `{ "error": "Internal server error" }` and nothing else: no stack trace and no internal message. The full error and stack trace go only to the terminal and to `logs/error.log`. The log line shows `500`, and the server keeps running; when the database is back, the next request works again without a restart. Known errors (`400`, `404`, `409`, `415`) are still answered by the controllers.

**Error log file.** Each unexpected error is also appended to `logs/error.log` as one entry: timestamp (UTC), method, route, message and stack trace. The `logs/` folder is created automatically, and it is git-ignored. If the file can't be written, the terminal shows `could not write .../logs/error.log`, and the client still gets its `500`. Example entry, with the database stopped:

```
=== 2026-11-18T19:54:14.467Z GET /api/users
Message: Invalid `prisma.user.findMany()` invocation:
Stack:
Error [PrismaClientKnownRequestError]: ...
    at async Object.getAll (models/User.ts:179:18)
    at async getAll (controllers/ApiUserController.ts:27:28)
    ...
{ code: 'ECONNREFUSED', meta: { modelName: 'User' }, clientVersion: '7.10.0' }
```

**404 page (website).** `app/not-found.tsx` is the one 404 page of the website, shown inside the normal header and footer: a large serif "404", "There is no page at this address." and a "Back to the home page" button (Week 9 design). Next.js shows it for any unknown page URL (`/banana`) and whenever a page calls `notFound()`, which the `/users/:id` and `/announcements/:id` pages (and their `/edit` pages) do for an unknown or invalid id (`/users/9999`, `/users/abc`). The status is `404`. The API never shows this page; it keeps its JSON 404.

**500 page (website, Week 9).** `app/error.tsx` is shown inside the header and footer when a page fails on the server, for example `/users` while the database is stopped: a large serif "500", "Something went wrong on our side.", a "Try again" button and a link home. The status is `500`. It never shows the error message, a digest or a stack trace; the full error is only in the server's terminal. "Try again" calls Next.js's `retry()`, which fetches the page again, so it works as soon as the database is back. `app/global-error.tsx` is the same page for the rare case where the root layout itself fails. The pages share `components/StatusPage.tsx`. In development (`npm run dev`), Next.js shows its own error overlay with the stack instead; the 500 page is what visitors see in production.

---

## Authentication and Authorization

### Overview

Every user has one role, stored in `users.role`:

| Role | Who | May do |
| --- | --- | --- |
| `ADMIN` | Department staff | Everything below, plus the admin panel: manage users and their roles, announcements, job postings and applications |
| `ALUMNI` | Graduates | Use the directory (`/users`), browse and apply to jobs, edit their own profile and password, see and withdraw their own applications |
| `STUDENT` | Current students | The same as `ALUMNI` (the two roles have the same rights today; `isAlumni` says whether someone graduated) |

**Login says who you are; the access rules say what you may do.** Login turns an email and password into a session; every page, form and endpoint then checks one rule from `lib/access.ts` against that session's user.

### Register and login

| | Page | API |
| --- | --- | --- |
| Register | `/register` (Alumni or Student only; `ADMIN` can't be chosen). You are logged in straight away | `POST /api/register` |
| Log in | `/login` (back to `?next=<path>` afterwards, relative paths only) | `POST /api/login` |
| Log out | The "Log out" button in the header (a POST form) | `POST /api/logout` |
| Who am I | The header shows your name and role | `GET /api/me` |

- **Passwords:** only a bcrypt hash (`bcryptjs`, cost 10) is stored in `users.passwordHash`, never the password. The hash is never returned, shown or logged. An unknown email and a wrong password get the same answer: "Email or password is wrong."
- **Sessions:** login makes a random token (32 bytes) and sends it in the `homecoming_session` cookie (`httpOnly`, `SameSite=Lax`, `Secure` in production). The `sessions` table keeps only the token's SHA-256 hash. A session lasts **7 days**. Logging out deletes its row and clears the cookie; an expired session is rejected and deleted. Changing your password on `/me` deletes your other sessions and keeps the current one.

### Access rules

Every page, form and API endpoint has exactly one rule, in **one rules map, `lib/access.ts`**. The full table, row by row, is in [ddd.md](ddd.md) (Access rules). In short:

| Rule | Pages and forms | API |
| --- | --- | --- |
| **public** | `/`, `/about`, `/login`, `/register`, `/announcements`, `/announcements/:id`, the 404, 403 and 500 pages, Log out | `POST /api/login`, `/api/register`, `/api/logout`; `GET /api/announcements(/:id)`; Swagger; `/api/health`, `/hello`, `/sum` (no data) |
| **logged in** | `/users`, `/users/:id`, `/jobs` and Apply, `/me` and its forms, `/me/applications` and Withdraw (always your own data) | `GET /api/me`, `/api/users`, `/api/users/:id`, `/api/users/:id/jobs`; `POST /api/jobs/:id/applications` (as yourself, status `applied`) |
| **owner or admin** | `/users/:id/edit` and its form; Delete a user | `PUT`/`PATCH`/`DELETE /api/users/:id`; `GET /api/users/:id/applications`; `GET /api/jobs/:id/applications` and `PATCH /api/applications/:id` (the posting's owner, never the applicant) |
| **admin only** | `/admin` and its sections and forms; "Add a user"; "Post an announcement", `/announcements/:id/edit` and Delete an announcement | `POST /api/users`, `PATCH /api/users/:id/role`, `POST /api/users/:id/jobs`, `PATCH`/`DELETE /api/jobs/:id`, `DELETE /api/applications/:id`, `POST /api/announcements`, `PUT`/`PATCH`/`DELETE /api/announcements/:id` |

**What happens otherwise.** Pages: not logged in → `303` to `/login?next=<path>`; wrong role or not the owner → the 403 page. API: `401` `{ "error": "Not logged in." }` or `403` `{ "error": "Forbidden", "reason": "..." }`, both logged by `withLogger`.

**How it is built.** `withAuth` wraps the API handlers, pages call `guardPage`, and every server action calls `guardForm` itself (an action can be posted to any page). `proxy.ts` sends visitors without a cookie to `/login` early. All of them ask the same `decide()` in `lib/access.ts`.

### Navigation, user pages and admin panel

- **Navigation by role:** the header's menu comes from one list, `lib/navigation.ts`, and shows an item only if `can()` from `lib/access.ts` allows its page. Logged out: Home, About, Announcements, Log in, Register. `STUDENT` and `ALUMNI`: Home, About, Announcements, Users, Jobs, My profile, My applications, and your name with a role label and Log out. `ADMIN`: the same plus Admin. The current page is marked with `aria-current="page"`.
- **Your pages** (always the session user, never an id from the URL or a form): `/me` shows your details, an edit form for full name, school and graduation year (not email or role), and Change password. `/me/applications` lists your applications with Withdraw. `/jobs` lists every posting with Apply, or "Applied" once you applied (a second application is refused).
- **Admin panel** (admin only, "Admin" in the menu): `/admin` (users by role and the counts), `/admin/users` (change a role, edit, delete), `/admin/announcements` (post, edit, delete), `/admin/jobs` (create for a chosen owner, edit, delete) and `/admin/applications` (change the status to applied, reviewed, hired or rejected, or delete). Safety rules in the model: an admin can't delete their own account, and the last admin can't be demoted or deleted.

### Try it

1. **As a seeded user:** the seed's users are `ALUMNI` or `STUDENT`, and all share the **demo-only** password `homecoming-demo` (development only, never for a real account or a hosted database). `/users` and `/api/users` need a login, so take a first email from the database: `docker compose exec db psql -U alumni -d alumni -c "SELECT email, role FROM users ORDER BY id LIMIT 5;"`. Log in on `/login`; after that, `/users` and `GET /api/users` list everyone else's email.
2. **As an admin:** the seed makes no admin. Register your own account on `/register`, then run `npm run make-admin -- <your email>` and reload: the header shows **Admin**. More admins can be made on `/admin/users`.
3. **Resetting:** running the seed again (`npx prisma db seed`) deletes every account and session, your own admin too, so register and run `make-admin` again afterwards.

### Security notes and limitations

- **No rate limiting:** login attempts are not limited, so passwords can be guessed without a slowdown.
- **No CSRF tokens:** forms and the API rely on the `SameSite=Lax` session cookie (and the Origin check Next.js does for server actions); there is no separate CSRF token.
- **No email verification and no password reset:** anyone can register with any email address, and a forgotten password can't be reset.
- **Hiding is only looks:** a menu item or button you may not use is hidden, but the guard on the page, form or endpoint is the real check.

---

## Design

How login and access work: see [Authentication and Authorization](#authentication-and-authorization).

The [Brand kit](BRAND.md) sets the look of **Homecoming** (Week 9): the name and promise, the colours, fonts, shapes, voice, wordmark and motion. The [Design rules](DESIGN.md) say how the pages use it: three references (layout, table, empty state), the CSS variables for `:root`, and the rules for the layout, the stylesheet and the components (one card, one button hover, one standalone link, one table, one form width, one empty state). Motion is subtle: the page content fades in, cards and table rows enter one after another, cards lift 2px on hover, link underlines slide in, buttons change colour and shrink slightly when pressed, and the homepage numbers count up once; people with `prefers-reduced-motion: reduce` get no movement. In the website forms, errors are shown in plain words ("Full name is required."); the JSON API keeps its own messages.

### Before and after

Screenshots (1440 px wide, full page) are in [docs/design/](docs/design/).

| Before | After |
| --- | --- |
| ![The /users page before the redesign](docs/design/before-users.png) | ![The /users page after the redesign](docs/design/after-users.png) |
| `/users` | `/users` |
| ![A user's page before the redesign](docs/design/before-user.png) | ![A user's profile after the redesign](docs/design/after-user.png) |
| `/users/1` | `/users/1` |

New pages, after:

| Homepage | Announcements | One announcement |
| --- | --- | --- |
| ![The new homepage](docs/design/after-home.png) | ![The new announcements list](docs/design/after-announcements.png) | ![The new announcement page](docs/design/after-announcement.png) |

| 404 page | 500 page |
| --- | --- |
| ![The 404 page](docs/design/after-404.png) | ![The 500 page](docs/design/after-500.png) |

---

## ⚠️ Current Limitations

- **The database must be running.** Users and announcements are stored in PostgreSQL, so the `db` container must be up and the migrations applied (see the Database section). Without it, the pages show the 500 page (the homepage still shows, without its numbers) and the API answers `500` `{ "error": "Internal server error" }`; both work again as soon as the database is back. Running the seed deletes all users, announcements, job postings and applications and inserts fake data.
- **A refused form without JavaScript shows the 404 page.** When the access guard refuses a form sent by a browser without JavaScript, Next.js renders its "not found" page instead of the 403 page. With JavaScript it is the 403 page. Either way nothing is changed.
- **An expired cookie redirects with `307`.** Without a cookie, a protected page answers `303` to `/login` (from `proxy.ts`); with a cookie that no longer works, the page itself redirects, and Next.js uses `307` there.
- **No rate limiting.** Nothing limits how many login attempts can be made, so passwords can be guessed without a slowdown.
- **No email verification.** Anyone can register with any email address, including one that isn't theirs. There is no password reset either.
- **Old sessions are deleted only when used.** An expired session's row is removed the next time its cookie is sent; rows of browsers that never come back stay until the seed (or a later clean-up job) removes them.
- **Demo-only password.** Every seeded user (and every user that existed before the Week 10 migration) has the password **`homecoming-demo`**. It is for development only, is written in this README and in the code, and must never be used for a real account or on a hosted database.
- **Users from `/api/users` and the `/users` form can't sign in.** They get the hash of a random password, and there is no password reset yet.
- **The edit form can't clear a field.** Empty fields keep their old value, so `school` can't be removed from the web form. A `PUT` through the API replaces the whole user.
- **No search, sorting or paging** on the users list.
- **No automated tests yet.** Routes have been checked by hand, with curl, Postman and Swagger.
- **`logs/error.log` keeps growing.** There is no rotation or size limit. Delete the file when it gets too big; it is created again on the next error.
- **No `logs/error.log` inside Docker.** In the `web` container the app runs as the non-root `node` user, which can't create `/app/logs`. Each unexpected error then prints `could not write /app/logs/error.log` and the full error appears only in `docker compose logs web`. The request still gets its `500`, and the server keeps running.
- **The job posting title limit is checked by the app only.** The `title` column is `text` with no length limit, so rows written outside the app could be longer than 120 characters.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19+, 22.12+ or 24+ (Prisma 7 needs at least these versions; developed with Node.js 24)
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
| http://localhost:3000/banana | The generic "Page not found" page (any unknown URL) |

To try the API from a terminal, log in as an admin (one you made with `npm run make-admin`, see step 6 below) and create a user with curl. Creating users is admin only (Week 10):

```bash
curl -c cookies.txt -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<your admin email>","password":"<your password>"}'
curl -i -b cookies.txt -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Zeynep Arslan","email":"zeynep.arslan@example.com","age":23,"school":"Istanbul University"}'
```

A successful request returns `201 Created` with the new user. Without the cookie it is `401`, and as a non-admin `403`.

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
| `DATABASE_URL` | Connection string used on your computer (host `localhost`) by the app (`npm run dev`), the migrations and the seed; keep it in sync with the three values above | `postgresql://alumni:change_me@localhost:5432/alumni` |

- Inside Docker, `docker-compose.yml` builds the web container's own `DATABASE_URL` (host `db`) from the three `POSTGRES_*` values; it doesn't use the one in `.env`. The app reads only `DATABASE_URL` (in `lib/prisma.ts`).
- **`.env` is git-ignored and must never be committed.** It is your real, local file.
- **`.env.example` is the committed template.** It contains only development values and no real secrets. When a new variable is needed, add it there with a comment.
- `docker-compose.yml` has **no default user or password**, so no password is in it. If `POSTGRES_USER` or `POSTGRES_PASSWORD` is missing, Docker Compose stops with a message such as `Set POSTGRES_PASSWORD in .env (copy .env.example to .env)`. Only `POSTGRES_DB` has a default (`alumni`).

### Running with Docker

With Docker Desktop running, build and start the app in a container:

```bash
docker compose up --build
```

Then open http://localhost:3000 (the same URLs as above work). The `web` container doesn't run the migrations: on a new, empty `postgres_data` volume, run them first from your computer (steps 3 and 4 of **Run the project from zero** below), otherwise the API answers `500`. The request log is in `docker compose logs web`. To stop and remove the container:

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

The tables are defined in `prisma/schema.prisma`, and Prisma Migrate turns them into SQL in `prisma/migrations/`. The first migration, `init`, creates the `users` and `announcements` tables; the second, `add_job_postings_applications` (Week 6), adds `job_postings` and `applications`; the third, `add_user_roles_and_passwords` (Week 10), adds the `Role` enum, `users.role` and `users.passwordHash`, makes `users.age` optional, and gives the existing users a role (user 1 `ADMIN`, the others `ALUMNI` or `STUDENT`) and the hash of the demo-only password `homecoming-demo`; the fourth, `add_sessions` (Week 10), adds the `sessions` table for login. Prisma runs on your computer, so it needs `DATABASE_URL` in `.env` (see Environment Variables).

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

**3. Run the migrations.** This applies every migration in `prisma/migrations/` that the database doesn't have yet. On a fresh database it creates all five tables: `users`, `announcements`, `job_postings`, `applications` and `sessions`.

```bash
npx prisma migrate deploy
```

**4. Run the seed.** First generate the Prisma Client (it is git-ignored, so a fresh clone doesn't have it). Then fill the tables with fake development data: the seed empties all five tables (so everyone is logged out) and inserts 20 fake users (`ALUMNI` or `STUDENT`, no `ADMIN`; all with the **demo-only** password `homecoming-demo`, never for real accounts), 5 fake announcements, 2 or 3 job postings for each of the first 10 users (25 in total), and 30 applications between random users and postings (never the same pair twice), made with Faker using a fixed seed, so every run gives the same rows. Running it again never adds duplicates. It refuses to run when `NODE_ENV` is `production`. **The seed is for development only:** it deletes everything and inserts fake people with the demo-only password, and it creates **no admin** (see step 6). See [ddd.md](ddd.md).

```bash
npx prisma generate
npx prisma db seed
```

**5. Start the app** at http://localhost:3000. The pages and the API read and write the database, so `/users` shows the 20 seeded users and `/announcements` the 5 seeded announcements.

```bash
npm run dev
```

**6. Make yourself an admin.** The seed creates **no** admin (its users are `ALUMNI` or `STUDENT`). Register your own account on http://localhost:3000/register, then promote it from a terminal:

```bash
npm run make-admin -- you@example.com
```

It prints for example `Ayşe Yılmaz (you@example.com, id 21) is now an admin (was STUDENT).`, or `No user has the email "…"` (exit code `1`) if nobody registered with that email. It only promotes, and never prints a password or hash. Log out and in again, or just reload: the header now shows **Admin**, and `/admin` opens. Later admins can be made on `/admin/users`. Run the seed again and your account is gone too, so register and run `make-admin` again afterwards.

**7. Log in** at http://localhost:3000/login with your account, or with any seeded user's email (from `/users`) and the **demo-only** password `homecoming-demo`. From a terminal:

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<a seeded email>","password":"homecoming-demo"}'
curl -b cookies.txt http://localhost:3000/api/me          # 200 with the user
curl -b cookies.txt -X POST http://localhost:3000/api/logout   # 204
```

The seed empties `sessions` too, so running it logs everyone out.

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
