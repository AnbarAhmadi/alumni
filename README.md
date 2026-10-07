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
| Language | TypeScript (TypeScript 7 for type checking; the TypeScript 6 API is installed alongside it for ESLint) |
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Architecture | MVC: in-memory User model, two controllers, React view components |
| Data | In memory (`models/User.ts`); no database yet, so data resets when the server restarts |
| API documentation | OpenAPI 3 spec with Swagger UI (loaded from the unpkg CDN) |
| Tools | ESLint 9 with `eslint-config-next`, npm, Git & GitHub |

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
├── eslint.config.mjs  # ESLint config (Next.js recommended + TypeScript rules)
├── next.config.ts     # Next.js config (output: "standalone")
├── tsconfig.json      # TypeScript config ("@/..." import alias)
├── package.json
└── README.md
```

---
## 🚀 Getting Started

### Prerequisites

- Node.js 20.9 or later (developed with Node.js 24)
- npm

No database or environment variables are needed: users are kept in memory, the server starts with 3 sample users, and they reset when the server restarts.

### Run in development

```bash
npm install
npm run dev
```

Then open:

- http://localhost:3000/users for the users pages (list, create, view, edit, delete)
- http://localhost:3000/api/users for the JSON API
- http://localhost:3000/api/swagger for the API documentation

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server at http://localhost:3000 |
| `npm run build` | Creates a production build (also type-checks the code) |
| `npm run lint` | Runs ESLint |
| `npx tsc --noEmit` | Type-checks the code without building |

### Run a production build

`next.config.ts` uses `output: "standalone"`, so the production build is started with the generated `server.js` rather than `npm start`:

```bash
npm run build
cp -r .next/static .next/standalone/.next/
node .next/standalone/server.js
```

The app is then at http://localhost:3000 (set `PORT` to use another port).

---
## 🏗️ MVC Architecture

### What MVC means here

**MVC (Model–View–Controller)** splits the code into three parts with one job each:

- **Model:** the data and its rules. It stores users, validates them and does create/read/update/delete. It knows nothing about HTTP or React.
- **View:** what the user sees. React components that only display the data they are given.
- **Controller:** the go-between. It takes a request, asks the model for data or changes, and decides what to send back.

In Next.js the `app/` folder is the router: a file's location decides its URL. Route files (`route.ts`, `page.tsx`) stay thin and hand each request to a controller. There are two controllers for the same model:

- `ApiUserController` answers the JSON API (`/api/users`) with HTTP status codes.
- `UserController` serves the web pages (`/users`) and returns `{ ok, data, error }` results to the pages and their server actions, with no HTTP code.

Both controllers reach the data only through `UserModel`. Users are currently kept **in memory** (no database), so they reset when the server restarts; the server starts with 3 sample users. Moving to a database later only changes `models/User.ts`.

### Directory structure

```
alumni/
├── models/
│   └── User.ts                    # Model: User type, in-memory store, validation, UserModel CRUD
├── controllers/
│   ├── ApiUserController.ts       # Controller for the JSON API: status codes and error responses
│   └── UserController.ts          # Controller for the web pages: index/show/create/update/remove return { ok, data, error }
├── components/                    # Views: reusable React UI
│   ├── UserTable.tsx              # Users table with View/Edit/Delete; empty state; "Added <name>" notice
│   ├── UserDetails.tsx            # One user shown as label/value rows
│   ├── UserForm.tsx               # Create/edit form; error under the field, typed values kept (client component)
│   ├── DeleteUserButton.tsx       # Delete button that asks for confirmation first (client component)
│   └── UserNav.tsx                # Links between list, details, edit and "New user"
├── lib/
│   └── parseBody.ts               # Reads JSON, multipart/form-data and urlencoded bodies; drops "id"
├── app/                           # Routes: the file path is the URL
│   ├── layout.tsx                 # Site header, navigation and footer for every page
│   ├── page.tsx                   # Home page (/)
│   ├── globals.css                # Global styles, including the users pages
│   ├── about/page.tsx             # About page (/about)
│   ├── users/
│   │   ├── page.tsx               # Users list + "Add a user" form (/users)
│   │   ├── [id]/page.tsx          # User details with Edit and Delete (/users/:id)
│   │   ├── [id]/edit/page.tsx     # Edit form, prefilled (/users/:id/edit)
│   │   ├── [id]/not-found.tsx     # Friendly "User not found" view for unknown ids
│   │   └── actions.ts             # Server actions: createUserAction, updateUserAction, deleteUserAction
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

### Routes, controllers, models and views

**Web pages (`UserController`)**: the page or server action calls the controller, the controller calls the model, and the result is shown by view components from `components/`.

| Route | Server action | Controller function | Model function | View |
| --- | --- | --- | --- | --- |
| `GET /users` | | `UserController.index` | `UserModel.getAll` | `UserTable`, `UserForm` |
| `POST /users` ("Add a user" form) | `createUserAction` | `UserController.create` | `UserModel.create` | Redirect to `/users?created=:id` (row highlighted); errors shown in `UserForm` |
| `POST /users` (Delete on a row) | `deleteUserAction` | `UserController.remove` | `UserModel.remove` | Redirect to `/users` |
| `GET /users/:id` | | `UserController.show` | `UserModel.getById` | `UserNav`, `UserDetails`, `DeleteUserButton`; `not-found.tsx` if no user |
| `POST /users/:id` (Delete) | `deleteUserAction` | `UserController.remove` | `UserModel.remove` | Redirect to `/users` |
| `GET /users/:id/edit` | | `UserController.show` | `UserModel.getById` | `UserNav`, `UserForm` (prefilled); `not-found.tsx` if no user |
| `POST /users/:id/edit` (Save) | `updateUserAction` | `UserController.update` | `UserModel.update` | Redirect to `/users/:id?updated=1`; errors shown in `UserForm` |

The POST rows are the pages' forms: Next.js server actions post back to the URL of the page the form is on.

**JSON API (`ApiUserController`)**: the response is JSON instead of a view.

| Route | Controller function | Model function(s) | Response |
| --- | --- | --- | --- |
| `GET /api/users` | `ApiUserController.getAll` | `UserModel.getAll` | `200` list of users |
| `POST /api/users` | `ApiUserController.create` | `UserModel.create` | `201` user, `400`, `415` |
| `GET /api/users/:id` | `ApiUserController.getById` | `UserModel.getById` | `200` user, `404` |
| `PUT /api/users/:id` | `ApiUserController.replace` | `UserModel.getById`, `UserModel.replace` | `200` user, `400`, `404`, `415` |
| `PATCH /api/users/:id` | `ApiUserController.update` | `UserModel.getById`, `UserModel.update` | `200` user, `400`, `404`, `415` |
| `DELETE /api/users/:id` | `ApiUserController.remove` | `UserModel.remove` | `204` no body, `404` |

`/api/health`, `/api/swagger`, `/hello` and `/sum` have no data, so they answer directly without a controller or model.

### Request flow example

`PATCH /api/users/2` with form-data `age=30`:

1. **Route:** `app/api/users/[id]/route.ts` reads the id from the URL and passes the request to `ApiUserController.update(request, "2")`.
2. **Controller:** checks that user 2 exists (`UserModel.getById`), reads the body with `parseBody` (turning `"30"` into the number `30`), and calls `UserModel.update(2, { age: 30 })`.
3. **Model:** validates the fields (age must be a positive whole number), changes only `age`, and returns the updated user. Invalid data throws a `ValidationError` that names the field.
4. **Response:** the controller returns `200` with the updated user as JSON. A `ValidationError` becomes `400 { "error": "...", "field": "age" }`, and an unknown id becomes `404`.

The web pages follow the same steps, except that in step 4 the page passes the data to a View component (for example `UserTable` or `UserDetails`), which renders the HTML.

### API documentation (Swagger)

With the app running (`npm run dev`), open **http://localhost:3000/api/swagger** for the Swagger UI. The **Users** tag documents the JSON API (`/api/users`, `/api/users/{id}`) with request bodies in JSON and form-data, response codes and examples. The **Users (views)** tag documents the HTML pages (`/users`, `/users/{id}`, `/users/{id}/edit`) and their form actions; those are server actions, so they can't be sent with Try it out. Use **Try it out** to send requests from the browser. The raw OpenAPI spec is at `/api/swagger/openapi.json`.

---
## 🔭 Planned / Future Work

These are planned for later in the course and are **not in this repository yet**:

- **Database:** Supabase (hosted PostgreSQL) with Prisma, replacing the in-memory store in `models/User.ts`. Because the controllers only call `UserModel`, they shouldn't need to change.
- **Alumni records:** an alumni directory with graduation details and current job, with its own pages and API routes.
- **Docker:** a Dockerfile and Docker Compose setup for running the app in containers.
- **Data export:** exporting records to CSV and Excel.
- **Authentication:** deferred for now; the current pages and API are open to anyone.

---
## 🏫 Course Information

- **Course:** Web Programming
- **Department:** Management Information Systems, Istanbul University
- **Student:** Anberin Ahmadi
- **Evaluation:** The instructor will select the student project that best demonstrates a working website to actually implement and use as the department's official alumni tracking platform.

---
## 📄 License

This project was developed for academic purposes as part of the Web Programming course at Istanbul University. It is not licensed for external use, redistribution, or commercial purposes without permission.# alumni
