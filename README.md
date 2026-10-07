# Alumni Tracking System

**Management Information Systems Department — Istanbul University**
> A full-stack web platform that keeps universities connected to their graduates, built a semester-long project from scratch for Web Programming course.
>
## 📖 Project Overview

The Web-Based Alumni Tracking System is a centralized platform built to strengthen the connection between Istanbul University and its graduates, since universities frequently lose contact with students after graduation. It replaces scattered, department-by-department record-keeping with one secure database, keeps alumni information current through user-driven profile updates, and helps current students and graduates connect for mentorship and professional networking.

All project decisions and progress — architecture desicion, design, and each round of development — will be documented and version-controlled in this repository as the semester unfolds.

---
## 🎓Prior Coursework: System Analysis & Design

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

This Web Programming implementation carries that analysis and design forward into working code; where this build diverges from the original design (e.g. the deferred authentication noted below), it is called out explicitly rather than left implicit.

---
## ✨ Features

Features have will be defined and added as the course progresses.

---
## 🛠️ Tech Stack

| Category | Technology |
| --- | --- |
| Language | TypeScript |
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Database | Supabase (hosted PostgreSQL), Prisma 7 (`@prisma/adapter-pg`) |
| Containerization | Docker, Docker Compose (multi-stage build, Next.js `standalone` output) |
| Data Export | `json2csv` (CSV), `exceljs` (Excel) |
| DevOps | Git & GitHub, npm, Node.js v24 LTS (`nvm`) |
| Tools | ESLint, `tsx`, Prisma Studio |

---
## 📁 Project Structure

The current layout of this repository (Next.js App Router). The MVC Architecture section below describes each file.

```
alumni/
├── app/               # Routes: the file path is the URL
│   ├── api/           # JSON API routes: users, health check, Swagger docs
│   ├── users/         # /users pages and their server actions
│   ├── about/         # /about page
│   ├── hello/, sum/   # Small example routes
│   ├── layout.tsx     # Shared header, navigation and footer
│   └── page.tsx       # Home page
├── models/            # Model: User data, validation and CRUD (kept in memory)
├── controllers/       # Controllers: UserController (web pages), ApiUserController (JSON API)
├── components/        # Views: reusable React components
├── lib/               # Shared helpers (request body parser)
├── next.config.ts     # Next.js config (output: "standalone")
├── tsconfig.json      # TypeScript config ("@/..." import alias)
├── package.json
└── README.md
```

Planned but not in this repository yet: the database (Supabase PostgreSQL with Prisma), the Docker setup, and the alumni pages and API routes.

---
## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- A Supabase project (free tier is enough)
- Node.js 20+ (only needed if running outside Docker)

**Environment setup**

bash

```bash
cp .env.example .env
```

Then fill in `DATABASE_URL` and `DIRECT_URL` as shown above.

Run with Docker (recommended)

bash

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`.

Run locally without Docker

bash

```bash
npm installnpm run dev
```

---
## 🏗️ MVC Architecture

### What MVC means here

**MVC (Model–View–Controller)** splits the code into three parts with one job each:

- **Model:** the data and its rules. It stores users, validates them and does create/read/update/delete. It knows nothing about HTTP or React.
- **View:** what the user sees. React components that only display the data they are given.
- **Controller:** the go-between. It takes a request, asks the model for data or changes, and decides what to send back.

In Next.js the `app/` folder is the router: a file's location decides its URL. Route files (`route.ts`, `page.tsx`) stay thin and hand each request to a controller. There are two controllers for the same model:

- `ApiUserController` answers the JSON API (`/api/users`) with HTTP status codes.
- `UserController` serves the web pages (`/users`) and returns plain data for the pages and their forms.

Both controllers reach the data only through `UserModel`. Users are currently kept **in memory** (no database), so they reset when the server restarts; the server starts with 3 sample users. Moving to a database later only changes `models/User.ts`.

### Directory structure

```
alumni/
├── models/
│   └── User.ts                    # Model: User type, in-memory store, validation, UserModel CRUD
├── controllers/
│   ├── ApiUserController.ts       # Controller for the JSON API: status codes and error responses
│   └── UserController.ts          # Controller for the web pages: returns plain data or { ok, data, error }
├── components/                    # Views: reusable React UI
│   ├── UserTable.tsx              # Table of all users with View and Delete buttons
│   ├── UserDetails.tsx            # One user shown as label/value pairs
│   ├── UserForm.tsx               # Create/edit form; shows validation errors (client component)
│   └── DeleteUserButton.tsx       # One-button form that runs the delete action
├── lib/
│   └── parseBody.ts               # Reads JSON, multipart/form-data and urlencoded bodies; drops "id"
├── app/                           # Routes: the file path is the URL
│   ├── layout.tsx                 # Site header, navigation and footer for every page
│   ├── page.tsx                   # Home page (/)
│   ├── globals.css                # Global styles, including the users pages
│   ├── about/page.tsx             # About page (/about)
│   ├── users/
│   │   ├── page.tsx               # Users list + "Add a user" form (/users)
│   │   ├── [id]/page.tsx          # User details + edit form + delete (/users/:id)
│   │   └── actions.ts             # Server actions behind the create, edit and delete forms
│   ├── api/
│   │   ├── users/route.ts         # GET, POST /api/users → ApiUserController
│   │   ├── users/[id]/route.ts    # GET, PUT, PATCH, DELETE /api/users/:id → ApiUserController
│   │   ├── health/route.ts        # GET /api/health → { "status": "ok" }
│   │   └── swagger/
│   │       ├── route.ts           # Swagger UI page (/api/swagger)
│   │       ├── openapi.ts         # OpenAPI 3 description of all routes
│   │       └── openapi.json/route.ts  # Serves the spec as JSON
│   ├── hello/route.ts             # Example: GET /hello (plain text)
│   ├── hello/[name]/route.ts      # Example: GET /hello/:name
│   └── sum/[number1]/[number2]/route.ts  # Example: adds two numbers
├── next.config.ts                 # Next.js config (output: "standalone")
├── tsconfig.json                  # TypeScript config; "@/..." imports start at the project root
└── package.json
```

### Routes, controllers and models

**JSON API (`ApiUserController`)**

| Route | Controller function | Model function(s) |
| --- | --- | --- |
| `GET /api/users` | `ApiUserController.getAll` | `UserModel.getAll` |
| `POST /api/users` | `ApiUserController.create` | `UserModel.create` |
| `GET /api/users/:id` | `ApiUserController.getById` | `UserModel.getById` |
| `PUT /api/users/:id` | `ApiUserController.replace` | `UserModel.getById`, `UserModel.replace` |
| `PATCH /api/users/:id` | `ApiUserController.update` | `UserModel.getById`, `UserModel.update` |
| `DELETE /api/users/:id` | `ApiUserController.remove` | `UserModel.remove` |

**Web pages (`UserController`)**

| Route / action | Controller function | Model function |
| --- | --- | --- |
| `GET /users` (page) | `UserController.index` | `UserModel.getAll` |
| `GET /users/:id` (page) | `UserController.show` | `UserModel.getById` |
| "Add a user" form on `/users` (`createUserAction`) | `UserController.create` | `UserModel.create` |
| Edit form on `/users/:id` (`updateUserAction`) | `UserController.update` | `UserModel.update` |
| Delete button (`deleteUserAction`) | `UserController.remove` | `UserModel.remove` |

`/api/health`, `/api/swagger`, `/hello` and `/sum` have no data, so they answer directly without a controller or model.

### Request flow example

`PATCH /api/users/2` with form-data `age=30`:

1. **Route:** `app/api/users/[id]/route.ts` reads the id from the URL and passes the request to `ApiUserController.update(request, "2")`.
2. **Controller:** checks that user 2 exists (`UserModel.getById`), reads the body with `parseBody` (turning `"30"` into the number `30`), and calls `UserModel.update(2, { age: 30 })`.
3. **Model:** validates the fields (age must be a positive whole number), changes only `age`, and returns the updated user. Invalid data throws a `ValidationError` that names the field.
4. **Response:** the controller returns `200` with the updated user as JSON. A `ValidationError` becomes `400 { "error": "...", "field": "age" }`, and an unknown id becomes `404`.

The web pages follow the same steps, except that in step 4 the page passes the data to a View component (for example `UserTable` or `UserDetails`), which renders the HTML.

### API documentation (Swagger)

With the app running (`npm run dev`), open **http://localhost:3000/api/swagger** for the Swagger UI. It documents the JSON API (`/api/users`, `/api/users/{id}`) and the `/users` pages, with request bodies in JSON and form-data, response codes and examples. Use **Try it out** to send requests from the browser. The raw OpenAPI spec is at `/api/swagger/openapi.json`.

---
## 🏫 Course Information

- **Course:** Web Programming
- **Department:** Management Information Systems, Istanbul University
- **Student:** Anberin Ahmadi
- **Evaluation:** The instructor will select the student project that best demonstrates a working website to actually implement and use as the department's official alumni tracking platform.

---
## 📄 License

This project was developed for academic purposes as part of the Web Programming course at Istanbul University. It is not licensed for external use, redistribution, or commercial purposes without permission.# alumni
