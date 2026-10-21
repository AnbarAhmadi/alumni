# Database Design Document

**Alumni Tracking System — Management Information Systems Department, Istanbul University**

Back to [README.md](README.md)

> This document describes the **database design** for the two tables, `users` and `announcements`. Some parts of the design are not in the code yet. Each one is marked **Planned, not implemented yet**, and the last section, **Differences between this design and the current code**, lists every place where the design and the code don't match.
>
> **The app uses the database.** `models/User.ts` and `models/Announcement.ts` read and write the PostgreSQL tables through Prisma Client (`lib/prisma.ts`). `npx prisma db seed` fills the tables with fake development data. The app's API and forms still use some older field names, which the model maps to the columns (see the Differences section).

---

## 🗄️ 1. DBMS

| | |
| --- | --- |
| **DBMS** | PostgreSQL |
| **Version** | **17.11**, fixed by the exact image tag `postgres:17.11-alpine` in `docker-compose.yml` |
| **Where it runs** | In a Docker container (see section 5) |

Why PostgreSQL:

1. **Relational data.** Users and announcements are records with fixed fields, a primary key and a unique email. That is exactly what tables, keys and constraints are for.
2. **Free and open source.** There are no license costs for the university or the students, and it runs the same on every laptop through Docker.
3. **Reliable.** It has transactions, strict data types and constraints (`NOT NULL`, `UNIQUE`), so bad data is stopped by the database as well as by the app.
4. **Works with Prisma and Supabase.** Prisma Migrate already builds the tables (section 7), and Supabase, the hosted option in the README's plans, is also PostgreSQL. A move to hosting later would not need a different DBMS.
5. **Fits users and announcements.** It has the types the design needs: `text`, `integer`, `boolean` and `timestamptz` for dates with a time zone.

---

## 📋 2. Tables and fields

Types are PostgreSQL types. "Required" means `NOT NULL`. Section 3 shows which fields already exist in the code.

### `users`

**Primary key:** `id`.

| Field | Type (PostgreSQL) | Required | Unique | Default |
| --- | --- | --- | --- | --- |
| `id` | `integer` (`SERIAL`) | Yes | Yes (primary key) | Next number from the sequence (`users_id_seq`) |
| `fullName` | `text` | Yes | No | — |
| `email` | `text` | Yes | **Yes** (`users_email_key`) | — |
| `age` | `integer` | Yes | No | — |
| `school` | `text` | No | No | `NULL` |
| `isAlumni` | `boolean` | Yes | No | `false` |
| `graduationYear` | `integer` | No | No | `NULL` |

### `announcements`

**Primary key:** `id`.

| Field | Type (PostgreSQL) | Required | Unique | Default |
| --- | --- | --- | --- | --- |
| `id` | `integer` (`SERIAL`) | Yes | Yes (primary key) | Next number from the sequence (`announcements_id_seq`) |
| `title` | `text` | Yes | No | — |
| `message` | `text` | Yes | No | — |
| `postedAt` | `timestamptz(3)` | Yes | No | `now()` (the moment the row is inserted) |

---

## 🧩 3. Fields in the design

"Exists" means the field is in the app's model (`models/*.ts`, the API and the forms) **and** in `prisma/schema.prisma` and the `init` migration. The database follows this design exactly; the app's model does not yet use every field, and uses older names for two of them. Rules marked "model" are checked in the TypeScript model today; see the Validation rules section below.

### `users`

| Field | Meaning | Rules | Example | Status in the code |
| --- | --- | --- | --- | --- |
| `id` | Number that identifies the user | Generated, never sent by the client | `1` | Exists |
| `fullName` | The person's full name | Not empty after trimming (model) | `Ayşe Yılmaz` | Exists |
| `email` | Contact email | Valid format (model); stored in lowercase; unique (database index `users_email_key`, so a duplicate gives `409`) | `ayse.yilmaz@example.com` | Exists |
| `age` | Age in years | Whole number greater than 0 (model) | `24` | Exists |
| `school` | School or university, optional | Not empty if sent (model) | `Istanbul University` | Exists |
| `isAlumni` | **New.** `true` if the person is a graduate, `false` if not | `true` or `false`; `false` when not given | `true` | In the schema and the `init` migration; **not in the app's model, API or forms yet** (new users get `false`) |
| `graduationYear` | **New.** The year the person graduated, optional | Whole number if given; other limits not decided yet | `2023` | In the schema and the `init` migration; **not in the app's model, API or forms yet** (new users get no year) |

### `announcements`

| Field | Meaning | Rules | Example | Status in the code |
| --- | --- | --- | --- | --- |
| `id` | Number that identifies the announcement | Generated, never sent by the client | `1` | Exists |
| `title` | Short headline | Not empty after trimming (model) | `Mentors wanted` | Exists |
| `message` | The announcement's body | Not empty after trimming | `We are looking for graduates…` | In the schema and the `init` migration; the app's API and forms call it `content`, and the model maps `content` ↔ `message` |
| `postedAt` | When the announcement was posted | Set automatically, never sent by the client | `2026-10-07T08:15:00.000Z` | In the schema and the `init` migration; the app's API calls it `createdAt` (an ISO string), and the model maps `createdAt` ↔ `postedAt` |

The app's announcement type still has an optional `author` field. It is **not part of this design** and has no column, so the model validates it when it is sent but never stores or returns it. See the Differences section.

---

## 🏷️ 4. Naming rules

These rules describe what `prisma/schema.prisma` and the `init` migration already do, and set the rule for new tables and fields.

| Rule | What the real schema does | Rule going forward |
| --- | --- | --- |
| **Table names** | Lowercase plural, set with `@@map`: `@@map("users")`, `@@map("announcements")` | Lowercase, plural, English. Two words would be joined with `_` (for example `event_registrations`). |
| **Prisma model names** | Singular PascalCase: `User`, `Announcement` | Same: one model per table, singular, PascalCase |
| **Column names** | camelCase, exactly the same as the model's field names, with no `@map` (`fullName`, `postedAt`). PostgreSQL stores them in double quotes (`"fullName"`). | Same: camelCase and identical to the TypeScript field, so one name is used everywhere (model, API JSON, database) |
| **Primary key** | A column called `id`, `integer` (`SERIAL`, Prisma `@default(autoincrement())`), constraint `<table>_pkey` | Same for every table |
| **Unique index** | Prisma's default name `<table>_<column>_key` (`users_email_key`) | Keep Prisma's default names |
| **Booleans** | `isAlumni` | Start with `is` or `has` and read as a yes/no question: `isAlumni` |
| **Dates and times** | `postedAt`, type `timestamptz(3)` | Type `timestamptz(3)`, and a name ending in `At` that says which moment it is (`postedAt`, later for example `updatedAt`) |
| **Foreign keys** | None yet (there are no relationships) | `<entity>Id` in camelCase, for example `userId` |
| **Words that are also SQL type names** | None (`message` and `postedAt` were chosen instead of `text` and `date`) | Avoid PostgreSQL type names such as `text`, `date` or `time` as column names |

---

## 🐳 5. How the database runs

All values come from `docker-compose.yml`.

| Item | Value |
| --- | --- |
| **Compose service name** | `db` (the container is called `alumni-db-1`) |
| **Image and version** | `postgres:17.11-alpine`: PostgreSQL 17.11 on Alpine Linux. The tag fixes the exact version, so every `docker compose pull` gets the same PostgreSQL release. |
| **Port** | `127.0.0.1:5432:5432`: PostgreSQL's port 5432, published **only on this computer** (`127.0.0.1`), so other machines on the network can't connect |
| **Named volume** | `postgres_data` (Docker names it `alumni_postgres_data`), mounted at `/var/lib/postgresql/data`, where PostgreSQL keeps its files. It is declared under the top-level `volumes:` key. |
| **Healthcheck** | `pg_isready -U $POSTGRES_USER -d $POSTGRES_DB` every 5 s, timeout 5 s, 10 retries, with a 10 s start period. `docker compose ps` shows `healthy` when it passes. |
| **Restart policy** | `restart: unless-stopped` |
| **Startup order** | The `web` service has `depends_on: db: condition: service_healthy`, so the app starts only after the database is healthy |

**Stopping:**

| Command | Containers | Data in `postgres_data` |
| --- | --- | --- |
| `docker compose down` | Stopped and removed | **Kept**: the tables and rows are still there after the next `docker compose up` |
| `docker compose down -v` | Stopped and removed | **Deleted**, together with the volume: the next `up` starts with an empty database, and the migrations must be applied again |

The README's Persistence test showed both cases.

---

## 🔐 6. Connection settings

| File | In Git? | What it holds |
| --- | --- | --- |
| `.env` | **No.** Git-ignored (`.gitignore` rule `.env*`) and **never committed** | Your real, local values. Docker Compose and Prisma read it. |
| `.env.example` | **Yes.** It is the committed template (allowed by `!.env.example`) | The same variable names, with development-only values and a comment for each. It contains **no real secrets**. Create your own file with `cp .env.example .env`. |

`.dockerignore` also excludes `.env` files, so they are never copied into the app image.

| Variable | What it is for |
| --- | --- |
| `POSTGRES_USER` | The PostgreSQL user that the `db` container creates on its first start |
| `POSTGRES_PASSWORD` | That user's password. The template has a development-only value; use your own secret password in `.env`. |
| `POSTGRES_DB` | The database that the `db` container creates on its first start |
| `DATABASE_URL` | The connection string Prisma uses **on your computer**: `postgresql://USER:PASSWORD@localhost:5432/DB`. Keep it in sync with the three values above. |

- **Inside Docker,** `docker-compose.yml` builds the `web` container's own `DATABASE_URL` from the three `POSTGRES_*` values, with host `db` instead of `localhost`. The app doesn't read it yet.
- **No defaults for the user and password.** `docker-compose.yml` reads `POSTGRES_USER` and `POSTGRES_PASSWORD` with `${VAR:?message}`, so no password is written in the committed file, and Compose stops with a clear message (for example `Set POSTGRES_PASSWORD in .env (copy .env.example to .env)`) if one is missing. This also applies to the `web` service's `DATABASE_URL`. Only `POSTGRES_DB` has a default (`alumni`), because it is not a secret. Prisma reads `DATABASE_URL` from `.env` or from the shell.
- **Users and databases are created only once.** PostgreSQL creates them when the volume is new. After changing `POSTGRES_*` in `.env`, the database only uses the new values after `docker compose down -v`, which deletes the data.

---

## 🧱 7. Migrations and seed

### Migrations (Prisma Migrate)

A migration is a versioned SQL file that changes the database structure. Every copy of the database can be brought to the same structure by applying the files in order.

| Item | Value |
| --- | --- |
| Tool | Prisma Migrate (`prisma` 7.10.0, a dev dependency) |
| Prisma Client | `@prisma/client` 7.10.0 and the PostgreSQL adapter `@prisma/adapter-pg` 7.10.0 are installed. `npx prisma generate` writes the client to `generated/prisma/`, which is git-ignored. **It is not imported anywhere in the app yet.** |
| Settings | `prisma.config.ts`: schema path, migrations path, and `DATABASE_URL` loaded from `.env` |
| Table definitions | `prisma/schema.prisma` |
| SQL files | `prisma/migrations/<timestamp>_<name>/migration.sql`, plus `prisma/migrations/migration_lock.toml` (provider `postgresql`) |

Migrations so far:

| Migration | Status | What it does |
| --- | --- | --- |
| `20261021215739_init` | **Applied** (the only migration) | Creates `users` (`id`, `fullName`, `email`, `age`, `school`, `isAlumni` with default `false`, `graduationYear`) and `announcements` (`id`, `title`, `message`, `postedAt` with default `now()`), the two primary keys, and the unique index `users_email_key` |

This `init` migration was rebuilt on 2026-10-22 with `npx prisma migrate reset` and `npx prisma migrate dev --name init`, while both tables were empty. It replaced an earlier, never-committed `init` migration (`20261014080338_init`) that still had `content`, `author` and `createdAt`, and no `isAlumni` or `graduationYear`.

Commands:

```bash
docker compose up -d db                     # start only the database, wait until healthy
npx prisma migrate dev --name <change>      # after editing schema.prisma: create a new migration and apply it
npx prisma migrate dev                      # apply existing migrations to a new or empty database
npx prisma migrate status                   # check that the database is up to date
npx prisma migrate deploy                   # apply migrations without creating new ones (staging/production)
npx prisma generate                         # write the Prisma Client to generated/prisma/ (git-ignored)
```

### Seed for development

The seed fills the tables with **fake data only, never real people**. Every email ends in `@example.com`, a domain reserved for examples.

| Part | Value |
| --- | --- |
| Files | `prisma/seed.mts` (the script), `prisma/factories/userFactory.mts` and `prisma/factories/announcementFactory.mts` (one factory per table) |
| How it runs | `npx prisma db seed`, which runs `migrations.seed` from `prisma.config.ts`: `node prisma/seed.mts`. Node 24 runs the `.mts` file directly, so no TypeScript runner is installed. |
| Database access | Prisma Client (`generated/prisma/client.mts`) with the PostgreSQL adapter `@prisma/adapter-pg`, using `DATABASE_URL` from `.env`. Run `npx prisma generate` first on a fresh clone. |
| What it does | In one transaction: `TRUNCATE TABLE "users", "announcements" RESTART IDENTITY`, then inserts **20 users** and **5 announcements**. Running it twice still leaves exactly 20 and 5, with ids starting at 1. |
| Same data every run | Faker (`@faker-js/faker`, a dev dependency) with a fixed seed (`2026`) and a fixed reference date (`2026-10-01T09:00:00Z`) |
| Safety | Refuses to run when `NODE_ENV` is `production`, because it deletes all users and announcements |
| When | After the migrations, for example after `npx prisma migrate deploy` on a fresh database |

What the factories make:

| Table | Fields |
| --- | --- |
| `users` | `fullName` (Turkish first and last name), a unique `email` (`first.last@example.com`, with a number added if taken), `age` (22–45 for graduates, 18–25 for students), `school` (one of 5 universities, or empty for about 15%), `isAlumni` (about 60% `true`), and `graduationYear` **only when `isAlumni` is `true`** (otherwise empty) |
| `announcements` | `title` and `message` from 6 realistic templates (meetup, career talk, mentors wanted, class reunion, internships, profile update), 5 of them picked per run; `postedAt` is a past date in the year before the reference date |

The seed is for development only. The app shows these rows on `/users` and `/announcements` and in the API.

---

## 🔤 Data Types Used

| Type | In the app (TypeScript / JSON) | In PostgreSQL | Used for |
| --- | --- | --- | --- |
| Text | `string` | `text` | `fullName`, `email`, `school`, `title`, `message` |
| Whole number | `number` (only whole numbers are stored) | `integer` | `id`, `age`, `graduationYear` (in the database only) |
| Yes/no | `boolean` (not in the app yet) | `boolean` | `isAlumni` (in the database only) |
| Date and time | ISO 8601 `string` in UTC, made from the database value with `toISOString()`, for example `"2026-10-07T08:15:00.000Z"` | `timestamptz(3)` (to the millisecond) | `postedAt` (`createdAt` in the app's API) |
| Optional | Key left out of the JSON, never `null` | Nullable column (`NULL`) | `school`, `graduationYear` (in the database only) |

---

## 🔄 Type Conversion and Validation Rules

These are the **current** rules from `lib/parseBody.ts`, `models/User.ts` and `models/Announcement.ts`. They use the code's field names (`content`, `createdAt`, `author`). There are no rules for `isAlumni` and `graduationYear` yet.

### On the way in

- **JSON bodies** keep their JSON types. `"age": "25"` stays a string and is rejected. The body must be an object; invalid JSON and arrays give `400`.
- **Form bodies** (`multipart/form-data`, urlencoded) arrive as text. `formDataToObject` handles them:
  - It turns `age` into a number when it looks like one (`"25"` → `25`). `age` is the only numeric field it converts.
  - It skips empty fields, so an empty field counts as "not sent".
  - It skips uploaded files.
  - If a name appears twice, the last value is kept.
- **An `id` in the body is always ignored**, and so is an announcement's `createdAt`. Unknown keys are dropped.
- **Text fields are trimmed** by the model before they are checked and saved. **`email` is also lowercased**, so the case-sensitive unique index treats `Ayse@Example.com` and `ayse@example.com` as the same email.
- **Ids in the URL** must be digits only. Anything else matches no record (`404`).

### Validation (the model throws a `ValidationError` naming the field)

| Field | Rule | Message |
| --- | --- | --- |
| `fullName`, `email`, `age` (users); `title`, `content` (announcements) | Required on create (POST) and replace (PUT) | `"<field>" is required.` |
| `school` (users) | Required on PUT only (PUT needs every user field) | `"school" is required.` |
| All text fields | Must be a string and not empty after trimming; `null` is rejected | `"<field>" must be a non-empty string.` |
| `email` | Must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | `"email" must be a valid email address.` |
| `email` | Unique among users. Checked by the **database** (unique index `users_email_key`), not by a query before saving: the model catches Prisma's unique-violation error `P2002` and throws a `ConflictError`. A user may keep their own email. | `"email" is already used by another user.` (**409**, `field: "email"`) |
| `age` | A number, whole, greater than 0; no maximum | `"age" must be a positive whole number.` |
| PATCH / edit form | At least one known field | `Send at least one of: …` |
| Any field | No maximum length in the code | — |

**Error responses (JSON API):** `{ "error": "...", "field": "..." }`. `field` is present only when one field is to blame. The status codes are:

- `400`: validation failed, or the body can't be read;
- `404`: unknown id;
- `409`: conflict, the email is already used by another user (`{ "error": "\"email\" is already used by another user.", "field": "email" }`), on POST, PUT and PATCH `/api/users`;
- `415`: unsupported `Content-Type`.

Successful requests return `200`, `201` (created) or `204` (deleted). The web pages show the message under the field instead.

---

## 📨 Input Formats

| Content-Type | Accepted for POST, PUT, PATCH |
| --- | --- |
| `application/json` | Yes |
| `multipart/form-data` | Yes |
| `application/x-www-form-urlencoded` | Yes |
| Anything else, or none | No: `415` |

- Only the part before `;` counts (`application/json; charset=utf-8` works), and case doesn't matter.
- GET and DELETE read no body.
- The `/users` and `/announcements` web forms are server actions that send form data.

---

## 🔗 ER Diagram

The design's two tables. **There is no relationship** between `users` and `announcements`: neither table stores the other's id. Fields marked "database only" are in the schema and the migration, but the app's model, API and forms don't use them yet.

```mermaid
erDiagram
    USERS {
        int id PK "SERIAL"
        text fullName "required"
        text email UK "required, unique"
        int age "required"
        text school "optional"
        boolean isAlumni "required, default false (database only)"
        int graduationYear "optional (database only)"
    }
    ANNOUNCEMENTS {
        int id PK "SERIAL"
        text title "required"
        text message "required (content in the app model)"
        timestamptz postedAt "required, default now() (createdAt in the app model)"
    }
```

---

## 🛡️ Data Access Rule

**Only the models touch the data.**

- Only `models/User.ts` and `models/Announcement.ts` use the Prisma Client. Records can only be read or changed through the model functions: `getAll`, `getById`, `create`, `update`, `replace` and `remove`.
- **Controllers** call the model functions, and **pages and server actions** call the controllers.
- **View components** only receive records as props. They import the `User` and `Announcement` *types*, never the models.

This is what kept the move to PostgreSQL small. The storage code lives in the two model files, which now call Prisma Client (`lib/prisma.ts`) instead of arrays. The model functions became asynchronous, so the only other change was an `await` in the controllers, pages and server actions that call them.

---

## ⚖️ Differences between this design and the current code

Nothing in this table is hidden or presented as done. "Current code" means the models, the API, the views, `prisma/schema.prisma` and the `init` migration as they are now.

| Item | Design (this document) | Current code |
| --- | --- | --- |
| Announcement body field | `message` | `message` in the database; still `content` in the API JSON, forms, views and Swagger. The model maps `content` ↔ `message`. |
| Announcement date field | `postedAt`, `timestamptz(3)`, default `now()` | `postedAt` in the database, set by `DEFAULT now()`; still `createdAt` (an ISO string) in the API JSON, views and Swagger. The model maps `createdAt` ↔ `postedAt`. |
| Announcement `author` | Not in the design | Not in the database. Still accepted by the API and the forms (and validated: it must be a non-empty string if sent), but **never stored and never returned**. Swagger and the form still show it. |
| `users.isAlumni` | `boolean`, required, default `false` | In the database (new rows get `false`); not in the app's model, the API or the forms |
| `users.graduationYear` | `integer`, optional | In the database (new rows get no year); not in the app's model, the API or the forms |
| Development seed | Fake data for development, run by `npx prisma db seed` | **Matches:** `prisma/seed.mts` with two Faker factories inserts 20 fake users and 5 fake announcements into the database. The app shows these rows on its pages and in the API. |
| Where the app keeps data | PostgreSQL tables | **Matches:** the models use Prisma Client (`lib/prisma.ts`) with the pg adapter. The in-memory arrays and sample data are gone. |
| Email uniqueness | Unique | **Matches:** the database index `users_email_key` decides, and the API answers `409`. Emails are stored in lowercase, so the case-sensitive index works like a case-insensitive rule. Rows saved before this change (none after `npx prisma db seed`) could still have capital letters. |
| `age > 0` | Whole number greater than 0 | Checked only in the model; there is no `CHECK` constraint in the database |
| Form conversion of new fields | `isAlumni` would come from a checkbox, `graduationYear` from a number field | `formDataToObject` converts only `age`; nothing converts `isAlumni` or `graduationYear` from form text |
| Image version | PostgreSQL with a fixed version | **Matches:** `docker-compose.yml` uses the exact tag `postgres:17.11-alpine` (until 2026-10-22 it was `postgres:17-alpine`, which fixed only the major version) |
| Hosted database | This design runs PostgreSQL 17 in Docker | The README's Upcoming list still names Supabase (hosted PostgreSQL) with Prisma as the database |
| Separate Alumni table | Not in the design: alumni are users with `isAlumni` and `graduationYear` | Not in the code either. The old version of this document planned a separate `Alumni` table, and this design replaces that plan. |

---

Back to [README.md](README.md)
