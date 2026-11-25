# Database Design Document

**Homecoming — Management Information Systems Department, Istanbul University**

Back to [README.md](README.md)

> This document describes the **database design** for five tables: `users` and `announcements`, `job_postings` and `applications`, and `sessions` (Week 10, migration `20261125071955_add_sessions`). All five exist in the database; `job_postings` and `applications` were added in Week 6 by the migration `20261021223924_add_job_postings_applications`. Week 10 added `role` and `passwordHash` to `users` and made `age` optional (migration `20261125065612_add_user_roles_and_passwords`), with the register page and `POST /api/register`. Some parts of the design are not in the code yet (for example the role permissions, which wait for login); the **Status in the code** column of section 3 shows this for every field, and the last section, **Differences between this design and the current code**, lists every place where the design and the code don't match.
>
> **The app uses the database.** `models/User.ts`, `models/Announcement.ts`, `models/JobPosting.ts` and `models/Application.ts` read and write the PostgreSQL tables through Prisma Client (`lib/prisma.ts`). `npx prisma db seed` fills the tables with fake development data. The app's API and forms still use some older field names, which the model maps to the columns (see the Differences section).

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
| `age` | `integer` | No (since Week 10) | No | `NULL` |
| `school` | `text` | No | No | `NULL` |
| `isAlumni` | `boolean` | Yes | No | `false` |
| `graduationYear` | `integer` | No | No | `NULL` |
| `role` (Week 10) | `Role` (PostgreSQL enum: `ADMIN`, `ALUMNI`, `STUDENT`) | Yes | No | `'STUDENT'` |
| `passwordHash` (Week 10) | `text` | Yes | No | — (a bcrypt hash, never the password) |

`passwordHash` must **never appear in any API or page output** (see the Data Access Rule).

### `announcements`

**Primary key:** `id`.

| Field | Type (PostgreSQL) | Required | Unique | Default |
| --- | --- | --- | --- | --- |
| `id` | `integer` (`SERIAL`) | Yes | Yes (primary key) | Next number from the sequence (`announcements_id_seq`) |
| `title` | `text` | Yes | No | — |
| `message` | `text` | Yes | No | — |
| `postedAt` | `timestamptz(3)` | Yes | No | `now()` (the moment the row is inserted) |

### `job_postings`

**Primary key:** `id`. **Foreign key:** `userId` → `users.id`, `ON DELETE CASCADE` (see Delete rules in the Relationships section).

| Field | Type (PostgreSQL) | Required | Unique | Default |
| --- | --- | --- | --- | --- |
| `id` | `integer` (`SERIAL`) | Yes | Yes (primary key) | Next number from the sequence (`job_postings_id_seq`) |
| `userId` | `integer` | Yes | No | — (foreign key to `users.id`: the user who posted it) |
| `title` | `text` | Yes | No | — |
| `company` | `text` | Yes | No | — |
| `city` | `text` | No | No | `NULL` |
| `description` | `text` (long text, no length limit) | No | No | `NULL` |
| `createdAt` | `timestamptz(3)` | Yes | No | `now()` (set by the database) |

### `applications`

**Primary key:** `id`. **Foreign keys:** `userId` → `users.id` and `jobPostingId` → `job_postings.id`, both `ON DELETE CASCADE`. **Unique pair:** (`userId`, `jobPostingId`), so a user can apply to a posting only once.

| Field | Type (PostgreSQL) | Required | Unique | Default |
| --- | --- | --- | --- | --- |
| `id` | `integer` (`SERIAL`) | Yes | Yes (primary key) | Next number from the sequence (`applications_id_seq`) |
| `userId` | `integer` | Yes | **Yes, together with `jobPostingId`** (`applications_userId_jobPostingId_key`) | — (foreign key to `users.id`: the user who applies) |
| `jobPostingId` | `integer` | Yes | **Yes, together with `userId`** | — (foreign key to `job_postings.id`) |
| `status` | `text` | Yes | No | `'applied'` |
| `createdAt` | `timestamptz(3)` | Yes | No | `now()` (set by the database) |

### `sessions` (Week 10)

**Primary key:** `id`. **Foreign key:** `userId` → `users.id`, `ON DELETE CASCADE`. **Unique:** `tokenHash` (`sessions_tokenHash_key`).

| Field | Type (PostgreSQL) | Required | Unique | Default |
| --- | --- | --- | --- | --- |
| `id` | `integer` (`SERIAL`) | Yes | Yes (primary key) | Next number from the sequence (`sessions_id_seq`) |
| `tokenHash` | `text` | Yes | **Yes** (`sessions_tokenHash_key`) | — (the SHA-256 hash of the session token, never the token) |
| `userId` | `integer` | Yes | No | — (foreign key to `users.id`: the logged-in user) |
| `expiresAt` | `timestamptz(3)` | Yes | No | — (set by the app: 7 days after login) |
| `createdAt` | `timestamptz(3)` | Yes | No | `now()` (set by the database) |

---

## 🧩 3. Fields in the design

"Exists" means the field is in the app's model (`models/*.ts`, the API and the forms) **and** in `prisma/schema.prisma` and the `init` migration. The database follows this design exactly; the app's model does not yet use every field, and uses older names for two of them. Rules marked "model" are checked in the TypeScript model today; see the Validation rules section below.

### `users`

| Field | Meaning | Rules | Example | Status in the code |
| --- | --- | --- | --- | --- |
| `id` | Number that identifies the user | Generated, never sent by the client | `1` | Exists |
| `fullName` | The person's full name | Not empty after trimming (model) | `Ayşe Yılmaz` | Exists |
| `email` | Contact email | Valid format (model); stored in lowercase; unique (database index `users_email_key`, so a duplicate gives `409`) | `ayse.yilmaz@example.com` | Exists |
| `age` | Age in years | Whole number greater than 0 (model). Required by `POST`/`PUT /api/users` and the `/users` form; optional in the database since Week 10, because the register page doesn't ask for it (registered users have none, and the API leaves the key out) | `24` | Exists |
| `school` | School or university, optional | Not empty if sent (model) | `Istanbul University` | Exists |
| `isAlumni` | **New.** `true` if the person is a graduate, `false` if not | `true` or `false`; `false` when not given | `true` | In the schema and the `init` migration; shown read-only on the `/users` pages (an "Alumni" badge, Week 9); set to `true` by register for `ALUMNI` (Week 10); not in `/api/users` or the `/users` forms (users created there get `false`) |
| `graduationYear` | **New.** The year the person graduated, optional | Whole number if given. On register: required for `ALUMNI`, 4 digits, 1950 to the current year; not allowed for `STUDENT` (see Register rules) | `2023` | In the schema and the `init` migration; shown read-only on the `/users` pages (Week 9); set by register (Week 10); not in `/api/users` or the `/users` forms (users created there get no year) |
| `role` | What the user may do on the site: `ADMIN`, `ALUMNI` or `STUDENT` (see the Roles section) | One of the three values; `STUDENT` when not given. Register accepts only `ALUMNI` or `STUDENT` | `ALUMNI` | **Exists (Week 10):** in the schema and the migration `20261125065612_add_user_roles_and_passwords`; set by register and returned by `POST /api/register`. Users created by `/api/users` or the `/users` form get `STUDENT`. Not shown on the pages or in `/api/users` yet, and not enforced (see Roles) |
| `passwordHash` | A bcrypt hash of the user's password, used to check the password at login | Required. Made by the app from the password with `bcryptjs` (cost 10); the password itself is never stored. **Never returned** by the API, never shown on a page and never logged | `$2b$10$…` (a 60-character bcrypt hash) | **Exists (Week 10):** in the schema and the migration; written by `UserModel.register`, read only by `UserModel.authenticate` to compare it, never returned. Users created by `/api/users` or the `/users` form get the hash of a random password that nobody knows (they can't log in until a password reset exists) |

### `announcements`

| Field | Meaning | Rules | Example | Status in the code |
| --- | --- | --- | --- | --- |
| `id` | Number that identifies the announcement | Generated, never sent by the client | `1` | Exists |
| `title` | Short headline | Not empty after trimming (model) | `Mentors wanted` | Exists |
| `message` | The announcement's body | Not empty after trimming | `We are looking for graduates…` | In the schema and the `init` migration; the app's API and forms call it `content`, and the model maps `content` ↔ `message` |
| `postedAt` | When the announcement was posted | Set automatically, never sent by the client | `2026-10-07T08:15:00.000Z` | In the schema and the `init` migration; the app's API calls it `createdAt` (an ISO string), and the model maps `createdAt` ↔ `postedAt` |

The app's announcement type still has an optional `author` field. It is **not part of this design** and has no column, so the model validates it when it is sent but never stores or returns it. See the Differences section.

### `job_postings`

| Field | Meaning | Rules | Example | Status in the code |
| --- | --- | --- | --- | --- |
| `id` | Number that identifies the posting | Generated by the database | `1` | In the database (`20261021223924_add_job_postings_applications`) and `models/JobPosting.ts`; API `/api/users/:id/jobs` (list and create); shown (read-only) on the `/users/:id` page and, the newest 3, on the homepage |
| `userId` | The user who posted the job | Must be the id of an existing user | `3` | In the database (`20261021223924_add_job_postings_applications`) and `models/JobPosting.ts`; API `/api/users/:id/jobs` (list and create); shown (read-only) on the `/users/:id` page and, the newest 3, on the homepage |
| `title` | The job title | Required; not empty after trimming; **at most 120 characters** after trimming (model) | `Junior Data Analyst` | In the database (`20261021223924_add_job_postings_applications`) and `models/JobPosting.ts`; API `/api/users/:id/jobs` (list and create); shown (read-only) on the `/users/:id` page and, the newest 3, on the homepage |
| `company` | The company that offers the job | Required; not empty after trimming (model); no length limit | `Example Analytics A.Ş.` | In the database (`20261021223924_add_job_postings_applications`) and `models/JobPosting.ts`; API `/api/users/:id/jobs` (list and create); shown (read-only) on the `/users/:id` page and, the newest 3, on the homepage |
| `city` | Where the job is, optional | Optional; if sent, not empty after trimming (model) | `Istanbul` | In the database (`20261021223924_add_job_postings_applications`) and `models/JobPosting.ts`; API `/api/users/:id/jobs` (list and create); shown (read-only) on the `/users/:id` page and, the newest 3, on the homepage |
| `description` | A longer description of the job, optional | Optional; if sent, not empty after trimming (model); long text, no length limit | `Two days a week in the office…` | In the database (`20261021223924_add_job_postings_applications`) and `models/JobPosting.ts`; API `/api/users/:id/jobs` (list and create); shown (read-only) on the `/users/:id` page and, the newest 3, on the homepage |
| `createdAt` | When the posting was created | Set by the database, never sent by the client | `2026-10-20T09:00:00.000Z` | In the database (`20261021223924_add_job_postings_applications`) and `models/JobPosting.ts`; API `/api/users/:id/jobs` (list and create); shown (read-only) on the `/users/:id` page and, the newest 3, on the homepage |

**Validation rules for `job_postings` (Week 7)** (checked in `models/JobPosting.ts`; a broken rule gives `400` with `{ "error": "...", "field": "..." }`):

- `title`: required, at most **120 characters** after trimming (counted as Unicode characters, like PostgreSQL does). A longer title gives `"title" must be at most 120 characters.`
- `company`: required; not empty after trimming; no length limit.
- `city` and `description`: optional. If sent, they must be non-empty strings.

The 120-character limit is checked **only by the app**. The `title` column is still `text` with no length limit (no migration was made for it).

### `applications`

| Field | Meaning | Rules | Example | Status in the code |
| --- | --- | --- | --- | --- |
| `id` | Number that identifies the application | Generated by the database | `1` | In the database (`20261021223924_add_job_postings_applications`) and `models/Application.ts`; API `POST`/`GET /api/jobs/:id/applications`, `GET /api/users/:id/applications`; no pages yet |
| `userId` | The user who applies | Always the logged-in user (Week 10): taken from the session, never from the request body | `5` | In the database (`20261021223924_add_job_postings_applications`) and `models/Application.ts`; API `POST`/`GET /api/jobs/:id/applications`, `GET /api/users/:id/applications`; no pages yet |
| `jobPostingId` | The posting applied to | Must be the id of an existing posting; a user can apply to the same posting only once | `1` | In the database (`20261021223924_add_job_postings_applications`) and `models/Application.ts`; API `POST`/`GET /api/jobs/:id/applications`, `GET /api/users/:id/applications`; no pages yet |
| `status` | Where the application stands | Text. Always `applied` when the application is made (Week 10: a status sent with it is ignored). Only the posting's owner or an admin may change it, with `PATCH /api/applications/:id`; any non-empty text, as other values are not decided yet. | `applied` | In the database (`20261021223924_add_job_postings_applications`) and `models/Application.ts`; API `POST`/`GET /api/jobs/:id/applications`, `GET /api/users/:id/applications`; no pages yet |
| `createdAt` | When the user applied | Set by the database, never sent by the client | `2026-10-21T14:30:00.000Z` | In the database (`20261021223924_add_job_postings_applications`) and `models/Application.ts`; API `POST`/`GET /api/jobs/:id/applications`, `GET /api/users/:id/applications`; no pages yet |

### `sessions`

One row per logged-in browser or client. See the **Login and sessions** section.

| Field | Meaning | Rules | Example | Status in the code |
| --- | --- | --- | --- | --- |
| `id` | Number that identifies the session | Generated by the database | `1` | In the database (`20261125071955_add_sessions`) and `models/Session.ts`; used by `lib/session.ts` |
| `tokenHash` | The SHA-256 hash (hex) of the session token in the cookie | The token is 32 random bytes, base64url; only its hash is stored, so a copy of the table can't be used to log in. Never returned, shown or logged | `9f86d0…` (64 hex characters) | In the database (`20261125071955_add_sessions`, unique index `sessions_tokenHash_key`) and `models/Session.ts`; never selected for an answer |
| `userId` | The user who logged in | Must be the id of an existing user | `1` | In the database (`20261125071955_add_sessions`) and `models/Session.ts`; used by `lib/session.ts` |
| `expiresAt` | When the session stops working | 7 days after login. An expired session is rejected and its row deleted | `2026-12-02T09:00:00.000Z` | In the database (`20261125071955_add_sessions`) and `models/Session.ts`; used by `lib/session.ts` |
| `createdAt` | When the user logged in | Set by the database | `2026-11-25T09:00:00.000Z` | In the database (`20261125071955_add_sessions`) and `models/Session.ts`; used by `lib/session.ts` |

---

## 🏷️ 4. Naming rules

These rules describe what `prisma/schema.prisma` and the `init` migration already do, and set the rule for new tables and fields.

| Rule | What the real schema does | Rule going forward |
| --- | --- | --- |
| **Table names** | Lowercase plural, set with `@@map`: `@@map("users")`, `@@map("announcements")` | Lowercase, plural, English. Two words would be joined with `_` (for example `event_registrations`). |
| **Prisma model names** | Singular PascalCase: `User`, `Announcement` | Same: one model per table, singular, PascalCase |
| **Column names** | camelCase, exactly the same as the model's field names, with no `@map` (`fullName`, `postedAt`). PostgreSQL stores them in double quotes (`"fullName"`). | Same: camelCase and identical to the TypeScript field, so one name is used everywhere (model, API JSON, database) |
| **Primary key** | A column called `id`, `integer` (`SERIAL`, Prisma `@default(autoincrement())`), constraint `<table>_pkey` | Same for every table |
| **Unique index** | Prisma's default name `<table>_<column>_key` (`users_email_key`) | Keep Prisma's default names; for a pair of columns `<table>_<column1>_<column2>_key` (`applications_userId_jobPostingId_key`) |
| **Booleans** | `isAlumni` | Start with `is` or `has` and read as a yes/no question: `isAlumni` |
| **Enums** (Week 10) | `enum Role` (PostgreSQL type `"Role"`) with `ADMIN`, `ALUMNI`, `STUDENT`, used by `users.role` | Prisma `enum` with a singular PascalCase name, which is also the PostgreSQL type name (`Role`); values in `UPPER_CASE` English (`ADMIN`, `ALUMNI`, `STUDENT`); the column is named after what it holds, in camelCase (`role`) |
| **Secrets** (Week 10) | `users.passwordHash`, `sessions.tokenHash` | Never store a secret itself, only its hash; the column name says so and ends in `Hash` (`passwordHash`) |
| **Dates and times** | `postedAt`, type `timestamptz(3)` | Type `timestamptz(3)`, and a name ending in `At` that says which moment it is (`postedAt`, later for example `updatedAt`) |
| **Foreign keys** | `job_postings.userId`, `applications.userId`, `applications.jobPostingId`, with constraints `job_postings_userId_fkey`, `applications_userId_fkey` and `applications_jobPostingId_fkey` | `<entity>Id` in camelCase, for example `userId` and `jobPostingId`, with Prisma's default constraint name `<table>_<column>_fkey` (for example `job_postings_userId_fkey`). So the snake_case names `user_id`, `job_posting_id` and `created_at` are written `userId`, `jobPostingId` and `createdAt`. |
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
| `DATABASE_URL` | The connection string used **on your computer** by the app (`npm run dev`), the migrations and the seed: `postgresql://USER:PASSWORD@localhost:5432/DB`. Keep it in sync with the three values above. |

- **Inside Docker,** `docker-compose.yml` builds the `web` container's own `DATABASE_URL` from the three `POSTGRES_*` values, with host `db` instead of `localhost`. The app reads it in `lib/prisma.ts`.
- **No defaults for the user and password.** `docker-compose.yml` reads `POSTGRES_USER` and `POSTGRES_PASSWORD` with `${VAR:?message}`, so no password is written in the committed file, and Compose stops with a clear message (for example `Set POSTGRES_PASSWORD in .env (copy .env.example to .env)`) if one is missing. This also applies to the `web` service's `DATABASE_URL`. Only `POSTGRES_DB` has a default (`alumni`), because it is not a secret. Prisma reads `DATABASE_URL` from `.env` or from the shell.
- **Users and databases are created only once.** PostgreSQL creates them when the volume is new. After changing `POSTGRES_*` in `.env`, the database only uses the new values after `docker compose down -v`, which deletes the data.

---

## 🧱 7. Migrations and seed

### Migrations (Prisma Migrate)

A migration is a versioned SQL file that changes the database structure. Every copy of the database can be brought to the same structure by applying the files in order.

| Item | Value |
| --- | --- |
| Tool | Prisma Migrate (`prisma` 7.10.0, a dev dependency) |
| Prisma Client | `@prisma/client` 7.10.0 and the PostgreSQL adapter `@prisma/adapter-pg` 7.10.0 are installed. `npx prisma generate` writes the client to `generated/prisma/`, which is git-ignored. The app uses it through `lib/prisma.ts` (one shared client for the models), and the seed creates its own. |
| Settings | `prisma.config.ts`: schema path, migrations path, and `DATABASE_URL` loaded from `.env` |
| Table definitions | `prisma/schema.prisma` |
| SQL files | `prisma/migrations/<timestamp>_<name>/migration.sql`, plus `prisma/migrations/migration_lock.toml` (provider `postgresql`) |

Migrations so far:

| Migration | Status | What it does |
| --- | --- | --- |
| `20261021215739_init` | **Applied** | Creates `users` (`id`, `fullName`, `email`, `age`, `school`, `isAlumni` with default `false`, `graduationYear`) and `announcements` (`id`, `title`, `message`, `postedAt` with default `now()`), the two primary keys, and the unique index `users_email_key` |
| `20261021223924_add_job_postings_applications` | **Applied** | Creates `job_postings` and `applications` with their three foreign keys (`ON DELETE CASCADE`, and Prisma's default `ON UPDATE CASCADE`), the defaults (`status` `'applied'`, `createdAt` `now()`) and the unique pair (`userId`, `jobPostingId`). It was added as a new migration; `20261021215739_init` was not changed. |
| `20261125065612_add_user_roles_and_passwords` (Week 10) | **Applied** | Creates the enum `"Role"` (`ADMIN`, `ALUMNI`, `STUDENT`), adds `users.role` (default `'STUDENT'`) and `users.passwordHash`, and makes `users.age` optional. Existing rows are filled in before `passwordHash` becomes `NOT NULL`: user 1 gets `ADMIN`, the others `ALUMNI` if `isAlumni`, else `STUDENT`, and all get the bcrypt hash of the **demo-only** password `homecoming-demo` (the same hash as the seed). The older migrations were not changed. |
| `20261125071955_add_sessions` (Week 10) | **Applied** | Creates `sessions` (`id`, `tokenHash` with the unique index `sessions_tokenHash_key`, `userId`, `expiresAt`, `createdAt` with default `now()`) and the foreign key `sessions_userId_fkey` to `users.id` with `ON DELETE CASCADE`. Made by `npx prisma migrate dev --name add_sessions`; the older migrations were not changed. |

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
| Files | `prisma/seed.mts` (the script) and one factory per table in `prisma/factories/`: `userFactory.mts`, `announcementFactory.mts`, `jobPostingFactory.mts`, `applicationFactory.mts` |
| How it runs | `npx prisma db seed`, which runs `migrations.seed` from `prisma.config.ts`: `node prisma/seed.mts`. Node 24 runs the `.mts` file directly, so no TypeScript runner is installed. |
| Database access | Prisma Client (`generated/prisma/client.mts`) with the PostgreSQL adapter `@prisma/adapter-pg`, using `DATABASE_URL` from `.env`. Run `npx prisma generate` first on a fresh clone. |
| What it does | In one transaction: `TRUNCATE TABLE "sessions", "applications", "job_postings", "users", "announcements" RESTART IDENTITY` (sessions and applications first, then job postings, then the other tables; PostgreSQL only empties a referenced table in the same statement as the tables that point to it), then inserts **20 users** (`ALUMNI` or `STUDENT` by `isAlumni`, never `ADMIN`; all have the **demo-only** password `homecoming-demo`), **5 announcements**, **25 job postings** (2 or 3 for each of the first 10 users; the other 10 get none) and **30 applications**. Running it twice gives exactly the same rows, with ids starting at 1. |
| Same data every run | Faker (`@faker-js/faker`, a dev dependency) with a fixed seed (`2026`) and a fixed reference date (`2026-10-01T09:00:00Z`) |
| Safety | Refuses to run when `NODE_ENV` is `production`, because it deletes all users, announcements, job postings and applications |
| When | After the migrations, for example after `npx prisma migrate deploy` on a fresh database |

What the factories make:

| Table | Fields |
| --- | --- |
| `users` | `fullName` (Turkish first and last name), a unique `email` (`first.last@example.com`, with a number added if taken), `age` (22–45 for graduates, 18–25 for students), `school` (one of 5 universities, or empty for about 15%), `isAlumni` (about 60% `true`), and `graduationYear` **only when `isAlumni` is `true`** (otherwise empty); `role` `ALUMNI` if `isAlumni`, else `STUDENT` (never `ADMIN`: the first admin is made with `npm run make-admin`); `passwordHash` the bcrypt hash of the **demo-only** password `homecoming-demo`, made with a fixed salt so every run stores the same hash. Never use this password for a real account. |
| `announcements` | `title` and `message` from 6 realistic templates (meetup, career talk, mentors wanted, class reunion, internships, profile update), 5 of them picked per run; `postedAt` is a past date in the year before the reference date |
| `job_postings` | `userId` (one of the first 10 users), `title` (from 10 MIS-related job titles), `company` (a made-up company name), `city` (one of 6 Turkish cities, or empty for about 15%), `description` (a short realistic text, or empty for about 25%), `createdAt` in the 90 days before the reference date |
| `applications` | 30 different (`userId`, `jobPostingId`) pairs picked at random; nobody applies to their own posting; `status` is the default `applied`; `createdAt` between the posting date and the reference date |

The seed is for development only. The app shows these rows on `/users`, `/users/:id` (with the user's job postings) and `/announcements`, and in the API.

---

## 👥 Roles

Every user has exactly one `role` (Week 10). It is stored in `users.role` and is `STUDENT` when not given. The roles are stored; what each role may do is not enforced yet.

| Role | Who they are | What they may do |
| --- | --- | --- |
| `ADMIN` | Department staff who run the site | Manage users, announcements and job postings (create, edit, delete) |
| `ALUMNI` | Graduates of the department | Edit their own profile, view the directory, apply to postings |
| `STUDENT` | Current students | View the directory, apply to postings |

**Enforced through the Access rules below (Week 10).**

**Role and `isAlumni` are different things:** `role` is what you may do on the site, `isAlumni` is whether you graduated.

**`ADMIN` can't be chosen on the register page.** The register page offers only `ALUMNI` and `STUDENT`. Since Week 10 the seed creates no admin (its users are `ALUMNI` or `STUDENT` by `isAlumni`); the first admin is made from a terminal with `npm run make-admin -- <email>`, and after that an admin can make others on `/admin/users`.

**Safety rules (Week 10).** Checked in the model (`models/User.ts`), so they hold on every path: the admin panel, the Delete button on `/users`, and `DELETE /api/users/:id` / `PATCH /api/users/:id/role`.

| Rule | Message | API status |
| --- | --- | --- |
| An admin can't delete their own account | `You can't delete your own admin account.` | `409` |
| The last `ADMIN` can't be deleted | `The last admin can't be deleted.` | `409` |
| The last `ADMIN` can't be demoted (role changed to `ALUMNI` or `STUDENT`) | `The last admin can't be demoted. Make another user an admin first.` | `409` |

The count of admins and the change happen in one transaction, so two requests at once can't both pass. `npm run make-admin` only promotes, so it can never break these rules.

### Access rules (Week 10)

Every page, form and API endpoint has exactly one rule. The rules follow the Roles table:

| Rule | Who may | Otherwise: page | Otherwise: API |
| --- | --- | --- | --- |
| **public** | Everyone, logged in or not | — | — |
| **logged in** | Any logged-in user (any role) | `303` to `/login?next=<path>` | `401` `{ "error": "Not logged in." }` |
| **owner or admin** | The user the record belongs to, or an `ADMIN` | Not logged in: as above. Logged in: the 403 page | Not logged in: `401`. Logged in: `403` `{ "error": "Forbidden", "reason": "..." }` |
| **admin only** | An `ADMIN` | Not logged in: as above. Logged in: the 403 page | Not logged in: `401`. Logged in: `403` `{ "error": "Forbidden", "reason": "..." }` |

**Pages and forms:**

| Page or form | Rule | Owner |
| --- | --- | --- |
| `/` (home), `/about` | public | |
| `/login`, `/register` and their forms; the header's Log out button | public | |
| The 404 and 500 pages | public | |
| `/users` (the directory) | logged in | |
| The "Add a user" form on `/users` | admin only | |
| `/users/:id` (a profile) | logged in | |
| `/users/:id/edit` and its form | owner or admin | the user `:id` |
| The Delete button of a user (on `/users` and `/users/:id`) | owner or admin | the user `:id` |
| `/announcements`, `/announcements/:id` | public | |
| The "Post an announcement" form, `/announcements/:id/edit` and its form, the Delete button of an announcement | admin only | |
| `/admin` (the dashboard: users by role, the counts, links to the sections) | admin only | |
| `/admin/users` and its forms: change a role, delete a user (editing uses `/users/:id/edit`) | admin only | |
| `/admin/announcements`, `/admin/jobs`, `/admin/applications` (**Planned**, later parts) | admin only | |

**API:**

| Endpoint | Rule | Owner |
| --- | --- | --- |
| `POST /api/login`, `POST /api/register` | public | |
| `POST /api/logout` | public (without a session it changes nothing: `204`) | |
| `GET /api/me` | logged in | |
| `GET /api/users`, `GET /api/users/:id` | logged in | |
| `POST /api/users` | admin only | |
| `PUT`, `PATCH`, `DELETE /api/users/:id` | owner or admin (`DELETE` also follows the safety rules) | the user `:id` |
| `PATCH /api/users/:id/role` (Week 10, used by the admin panel) | admin only; follows the safety rules | |
| `GET /api/users/:id/jobs` | logged in | |
| `POST /api/users/:id/jobs` | admin only | |
| `GET /api/users/:id/applications` | owner or admin | the user `:id` |
| `POST /api/jobs/:id/applications` (apply) | logged in; **the applicant is always the session user and the status is always `applied`**: the body isn't read, so a `userId` or `status` in it is ignored | |
| `PATCH /api/applications/:id` (change the status) | owner or admin; only `status` changes. **Never the applicant** (unless they own the posting) | the user who owns the application's posting |
| `GET /api/jobs/:id/applications` (the applicants) | owner or admin | the user who owns the posting (`job_postings.userId`) |
| `GET /api/announcements`, `GET /api/announcements/:id` | public | |
| `POST /api/announcements`, `PUT`, `PATCH`, `DELETE /api/announcements/:id` | admin only | |
| `GET /api/swagger`, `GET /api/swagger/openapi.json` | public | |
| `GET /api/health`, `/hello`, `/hello/:name`, `/sum/:a/:b` | public (deliberate exceptions: they read and show no data) | |
| Any unknown path under `/api` | public (it answers the JSON `404`) | |

**Where it is enforced:** one rules map, `ACCESS_RULES` in `lib/access.ts`, which follows these tables (one key per row, for example `"PATCH /api/users/[id]": "ownerOrAdmin"`), and one decision function, `decide()`. `lib/guard.ts` applies it at every entry point:

| Entry point | Guard | Not logged in | No access |
| --- | --- | --- | --- |
| API route handlers | `withAuth(key, handler, owner?)`, inside `withLogger`, so every `401` and `403` is logged | `401` `{ "error": "Not logged in." }` (a cookie that no longer works is cleared) | `403` `{ "error": "Forbidden", "reason": "Only an admin can do this." }` or `"Only the owner of this record or an admin can do this."` |
| Pages | `guardPage(key, path, ownerId?)` at the top of the page | redirect to `/login?next=<path>` | `forbidden()`: the 403 page `app/forbidden.tsx` (status `403`) |
| Forms and buttons (server actions) | `guardForm(key, path, ownerId?)` at the top of each action: an action can be called with a POST to any page, so it checks itself | `303` to `/login?next=<path>` | `forbidden()`, nothing is changed |
| Before a page renders | `proxy.ts`: only whether a session cookie is there (no database) | `303` to `/login?next=<path>` | — (left to `guardPage`) |

The owner of a record: for `/users/:id` and `/api/users/:id/...` it is the user `:id`; for `/api/jobs/:id/applications` it is the user who owns the posting (looked up with `JobPostingModel.getById`); for `/api/applications/:id` it is the user who owns that application's posting (application, then posting). An admin passes without a lookup. Swagger reads the same map: every guarded operation lists its rule and its `401`/`403` answers.

Hiding a button the user may not use is only for looks; the guard is the real check. The views ask `can(key, viewer, ownerId)` from the same map: "Add a user" and "Post an announcement" (and their forms) show only for an admin; Edit and Delete of a user only on that user's own row or for an admin; Edit and Delete of an announcement only for an admin.

**Two details of Next.js:** a page whose cookie is there but no longer valid is redirected by `guardPage` with `307` (only `proxy.ts`, which runs before the page, can answer `303`). And a form sent **without JavaScript** that the guard refuses gets Next's 404 page instead of the 403 page (Next renders every `forbidden()` from a no-JavaScript form as "not found"); with JavaScript, the normal case, it is the 403 page. In both cases nothing is changed.

**Links back after login:** `/login?next=<path>` returns to `<path>` after a successful login, but only if it is a relative path on this site (it starts with one `/`); anything else, such as `//evil.example` or `https://…`, goes to the home page.

---

## 🔑 Login and sessions (Week 10)

Login checks a user's email and password and starts a session; the session is a row in `sessions` (migration `20261125071955_add_sessions`) and a cookie in the browser. Seeded users log in with their email and the **demo-only** password `homecoming-demo`.

**Login rules:**

1. **Email** and **password** are required. A missing one gives `400` with the field (`"email" is required.`, `"password" is required.`). The email is trimmed and lowercased, like on register.
2. **One generic error for everything else:** an unknown email and a wrong password both give `401` with exactly `Email or password is wrong.`, so the answer never tells whether an account exists.
3. The password is compared with `bcryptjs` against `users.passwordHash`. For an unknown email the app still runs a bcrypt compare against a dummy hash, so the time the answer takes doesn't tell either.

**Sessions:**

| Item | Rule |
| --- | --- |
| Token | 32 random bytes from `node:crypto`, written as base64url. It is sent to the browser in the cookie only. |
| What is stored | Only the token's SHA-256 hash (`sessions.tokenHash`), never the token |
| Lifetime | **7 days** from login (`sessions.expiresAt`); the cookie has the same lifetime |
| Expired session | Rejected (the user is logged out) and its row deleted |
| Logout | Deletes the session's row and clears the cookie |
| Deleting a user | Deletes their sessions (`ON DELETE CASCADE`) |

**Cookie settings:** name `homecoming_session`, `httpOnly` (JavaScript can't read it), `sameSite: lax`, `secure` in production (HTTPS only), `path: /`, max age 7 days.

**Where it lives:** `lib/session.ts` (`createSession`, `getCurrentUser`, `destroySession`) handles the cookie and calls `models/Session.ts` for the rows; checking the password is `UserModel.authenticate` in `models/User.ts`. The `/login` page, the Log out button and the API (`POST /api/login`, `POST /api/logout`, `GET /api/me`) all use them, through `controllers/AuthController.ts` and `controllers/ApiAuthController.ts`.

**What the answers look like:**

| Where | Success | Failure |
| --- | --- | --- |
| `POST /api/login` | `200` with the user (`id`, `fullName`, `email`, `age` if any, `school` if any, `isAlumni`, `graduationYear` if any, `role`) and the cookie | `400` `{ "error": "\"email\" is required.", "field": "email" }`; `401` `{ "error": "Email or password is wrong." }` |
| `POST /api/logout` | `204`, the row deleted, the cookie cleared (also when not logged in) | — |
| `GET /api/me` | `200` with the same user | `401` `{ "error": "Not logged in." }`; a cookie that no longer works is cleared |
| `/login` page | `303` to the home page; the header shows the user's name and "Log out" | The same form with the email kept, never the password, and the error in `--color-danger` |

Not built: no rate limiting of login attempts, no email verification, no password reset.

---

## 🔤 Data Types Used

| Type | In the app (TypeScript / JSON) | In PostgreSQL | Used for |
| --- | --- | --- | --- |
| Text | `string` | `text` | `fullName`, `email`, `school`, `title`, `message`, `company`, `city`, `description`, `status`, `passwordHash` (a bcrypt hash; never sent to the client) |
| Enum (Week 10) | `string` union `"ADMIN" \| "ALUMNI" \| "STUDENT"` | Enum type `Role` | `role` |
| Whole number | `number` (only whole numbers are stored) | `integer` | `id`, `age`, `userId`, `jobPostingId`, `graduationYear` (shown on the `/users` pages, set by register) |
| Yes/no | `boolean` | `boolean` | `isAlumni` (shown as an "Alumni" badge on the `/users` pages; set by register from the role; not in `/api/users` or the `/users` forms) |
| Date and time | ISO 8601 `string` in UTC, made from the database value with `toISOString()`, for example `"2026-10-07T08:15:00.000Z"` | `timestamptz(3)` (to the millisecond) | `postedAt` (`createdAt` in the app's API), `createdAt` (job postings and applications), `sessions.expiresAt` and `sessions.createdAt` (never sent to the client) |
| Optional | Key left out of the JSON, never `null` | Nullable column (`NULL`) | `age` (since Week 10), `school`, `city`, `description`, `graduationYear` |

---

## 🔄 Type Conversion and Validation Rules

These are the **current** rules from `lib/parseBody.ts`, `models/User.ts`, `models/Announcement.ts` and `models/JobPosting.ts`. They use the code's field names (`content`, `createdAt`, `author`). There are no rules for `isAlumni` and `graduationYear` yet.

### On the way in

- **JSON bodies** keep their JSON types. `"age": "25"` stays a string and is rejected. The body must be an object; invalid JSON and arrays give `400`.
- **Form bodies** (`multipart/form-data`, urlencoded) arrive as text. `formDataToObject` handles them:
  - It turns `age`, `userId`, `jobPostingId` and `graduationYear` (register, Week 10) into numbers when they look like one (`"25"` → `25`). These are the only numeric fields it converts.
  - It skips empty fields, so an empty field counts as "not sent".
  - It skips uploaded files.
  - If a name appears twice, the last value is kept.
- **An `id` in the body is always ignored**, and so is an announcement's `createdAt`. Unknown keys are dropped.
- **Text fields are trimmed** by the model before they are checked and saved. **`email` is also lowercased**, so the case-sensitive unique index treats `Ayse@Example.com` and `ayse@example.com` as the same email.
- **Ids in the URL** must be digits only. Anything else matches no record (`404`).

### Validation (the model throws a `ValidationError` naming the field)

| Field | Rule | Message |
| --- | --- | --- |
| `fullName`, `email`, `age` (users, `/api/users` and the `/users` form); `title`, `content` (announcements); `title`, `company` (job postings) | Required on create (POST) and replace (PUT) | `"<field>" is required.` |
| `school` (users) | Required on PUT only (PUT needs every user field) | `"school" is required.` |
| All text fields | Must be a string and not empty after trimming; `null` is rejected | `"<field>" must be a non-empty string.` |
| `email` | Must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | `"email" must be a valid email address.` |
| `email` | Unique among users. Checked by the **database** (unique index `users_email_key`), not by a query before saving: the model catches Prisma's unique-violation error `P2002` and throws a `ConflictError`. A user may keep their own email. | `"email" is already used by another user.` (**409**, `field: "email"`) |
| `age` | A number, whole, greater than 0; no maximum | `"age" must be a positive whole number.` |
| PATCH / edit form | At least one known field | `Send at least one of: …` |
| `title` (job postings, Week 7) | At most 120 characters after trimming | `"title" must be at most 120 characters.` |
| Any other field | No maximum length in the code | — |
| `fullName` (register) | Required; not empty after trimming | `"fullName" is required.` |
| `email` (register) | Required; trimmed and lowercased; valid format; unique (database index, `409`) | `"email" is required.`, `"email" must be a valid email address.`, `"email" is already used by another user.` |
| `password` (register) | Required; at least 8 characters. Only its bcrypt hash is stored (`passwordHash`) | `"password" must be at least 8 characters.` |
| `confirmPassword` (register) | Must be exactly the same as `password`; never stored | `"confirmPassword" must match "password".` |
| `role` (register) | Required; `ALUMNI` or `STUDENT` only (`ADMIN` is refused) | `"role" must be ALUMNI or STUDENT.` |
| `graduationYear` (register) | Required for `ALUMNI`: a 4-digit whole number from 1950 to the current year. Not allowed for `STUDENT` | `"graduationYear" is required for alumni.`, `"graduationYear" must be a year from 1950 to <current year>.`, `"graduationYear" is not allowed for students.` |
| `school` (register) | Optional; not empty if sent | `"school" must be a non-empty string.` |

### Register rules (Week 10)

These rules are checked in one place, `UserModel.register` (`models/User.ts`), for both the `/register` page and `POST /api/register`. They are listed in the validation table above, marked "register". Every broken rule is collected: the page shows each one under its field, and the API answers `400` with the first one (a taken email gives `409`).

1. **Full name:** required, not empty after trimming.
2. **Email:** required, trimmed and lowercased, a valid format, and unique among users.
3. **Password:** at least 8 characters. It is hashed with bcrypt and only the hash is stored in `passwordHash`; the password itself is never stored or logged.
4. **Confirm password:** must match the password. It is only checked, never stored.
5. **Role:** must be `ALUMNI` or `STUDENT`. `ADMIN` can't be chosen (see the Roles section).
6. **Graduation year:** required for `ALUMNI` (4 digits, 1950 to the current year); not allowed for `STUDENT`.
7. **School:** optional.

On the page, the messages are in plain words: "Password must be at least 8 characters.", "The passwords don't match.", "Choose Alumni or Student.", and "An account with this email already exists." for a taken email. An `ALUMNI` account gets `isAlumni: true`. No `age` is asked for, so registered users have none.

**Error responses (JSON API):** `{ "error": "...", "field": "..." }`. `field` is present only when one field is to blame. The status codes are:

- `400`: validation failed, or the body can't be read;
- `404`: unknown id or unknown `/api` path, always `{ "error": "Not found", "reason": "..." }` (for example `"User 9999 does not exist"`, `"No route GET /api/banana"`), never with `field` (Week 7, built in `lib/notFound.ts`);
- `409`: conflict, the email is already used by another user (`{ "error": "\"email\" is already used by another user.", "field": "email" }`), on POST, PUT and PATCH `/api/users`; or the user already applied to this posting (`field: "jobPostingId"`), on POST `/api/jobs/:id/applications`;
- `415`: unsupported `Content-Type`;
- `500`: unexpected error (for example the database is down), always `{ "error": "Internal server error" }` with no internal details; the full error is printed only in the server's terminal and appended to `logs/error.log` (Week 7, in `lib/withLogger.ts`).

Successful requests return `200`, `201` (created) or `204` (deleted). The web pages show the message under the field instead, in plain words (`"fullName" is required.` becomes "Full name is required."; the API keeps its exact messages). An unknown or invalid id in a page URL (`/users/9999`, `/users/abc`) shows the 404 page (`app/not-found.tsx`), and a page that fails on the server (for example while the database is down) shows the 500 page (`app/error.tsx`), never the error itself (Week 9).

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

## 🔗 Relationships and ER Diagram

`announcements` has no relationship with any other table: it doesn't store a user id. The other three tables are related through foreign keys in the database (migration `20261021223924_add_job_postings_applications`):

| Relationship | Type | How |
| --- | --- | --- |
| `users` → `job_postings` | One-to-many | One user has many job postings; each posting belongs to exactly one user (`job_postings.userId`, required). |
| `users` → `sessions` (Week 10) | One-to-many | A user can be logged in on several browsers at once; each session belongs to exactly one user (`sessions.userId`, required). |
| `users` ↔ `job_postings`, through `applications` | Many-to-many | A user can apply to many postings, and a posting can get applications from many users. Each `applications` row links one user (`userId`) to one posting (`jobPostingId`), and the unique pair (`userId`, `jobPostingId`) allows only one application per user and posting. |

### Delete rules

| Foreign key | `ON DELETE` | What it means | Reason |
| --- | --- | --- | --- |
| `job_postings.userId` → `users.id` | `CASCADE` | Deleting a user also deletes their job postings. | A posting has no meaning without its owner, so we avoid orphan postings. This matches how applications are handled. |
| `applications.userId` → `users.id` | `CASCADE` | Deleting a user also deletes their applications. | An application has no meaning without the user who made it. |
| `applications.jobPostingId` → `job_postings.id` | `CASCADE` | Deleting a posting also deletes the applications to it. | An application has no meaning without the posting it is for. |
| `sessions.userId` → `users.id` (Week 10) | `CASCADE` | Deleting a user also deletes their sessions. | A deleted user must not stay logged in. |

Deleting a user therefore removes their postings, the applications to those postings, and their own applications to other postings.

`isAlumni` and `graduationYear` are shown on the `/users` pages (Week 9) and set only by register (Week 10); `/api/users` and the `/users` forms don't use them. `job_postings` and `applications` exist in the database and have models (`models/JobPosting.ts`, `models/Application.ts`); job postings can be listed and created through `/api/users/:id/jobs`, and applications through `/api/jobs/:id/applications` and `/api/users/:id/applications`. The `/users/:id` page shows a user's job postings (read-only); there are no pages for applications yet. Each foreign key also has `ON UPDATE CASCADE` (Prisma's default); ids are never changed, so it has no effect.

```mermaid
erDiagram
    USERS ||--o{ JOB_POSTINGS : "posts"
    USERS ||--o{ APPLICATIONS : "applies with"
    USERS ||--o{ SESSIONS : "logs in with"
    JOB_POSTINGS ||--o{ APPLICATIONS : "receives"
    USERS {
        int id PK "SERIAL"
        text fullName "required"
        text email UK "required, unique"
        int age "optional since Week 10"
        text school "optional"
        boolean isAlumni "required, default false (set by register)"
        int graduationYear "optional (set by register for ALUMNI)"
        Role role "required, ADMIN ALUMNI STUDENT, default STUDENT"
        text passwordHash "required, bcrypt hash, never in output"
    }
    ANNOUNCEMENTS {
        int id PK "SERIAL"
        text title "required"
        text message "required (content in the app model)"
        timestamptz postedAt "required, default now() (createdAt in the app model)"
    }
    JOB_POSTINGS {
        int id PK "SERIAL"
        int userId FK "required, users.id, ON DELETE CASCADE"
        text title "required"
        text company "required"
        text city "optional"
        text description "optional, long text"
        timestamptz createdAt "required, default now()"
    }
    APPLICATIONS {
        int id PK "SERIAL"
        int userId FK, UK "users.id, ON DELETE CASCADE; unique with jobPostingId"
        int jobPostingId FK, UK "job_postings.id, ON DELETE CASCADE"
        text status "required, default applied"
        timestamptz createdAt "required, default now()"
    }
    SESSIONS {
        int id PK "SERIAL"
        text tokenHash UK "required, SHA-256 of the token, never in output"
        int userId FK "required, users.id, ON DELETE CASCADE"
        timestamptz expiresAt "required, 7 days after login"
        timestamptz createdAt "required, default now()"
    }
```

---

## 🛡️ Data Access Rule

**Only the models touch the data.**

- Only the model files (`models/User.ts`, `models/Announcement.ts`, `models/JobPosting.ts`, `models/Application.ts`, and `models/Session.ts` since Week 10) use the Prisma Client. Records can only be read or changed through the model functions: `getAll`, `getById`, `create`, `update`, `replace` and `remove`, plus the read-only `count` (users, announcements, job postings) and `getLatest` (announcements, job postings) used by the homepage through `controllers/HomeController.ts`, and the read-only `getAllWithStatus` and `getProfile` (users with `isAlumni` and `graduationYear`) used by the `/users` pages through `controllers/UserDirectoryController.ts` (Week 9).
- **`passwordHash` never leaves the model (Week 10).** It is written by `UserModel.create` and `UserModel.register`, and read only inside `UserModel.authenticate` to compare it with bcrypt; every other query selects named columns without it, and no model function returns it, so no controller, API answer or page can show it. The same goes for `sessions.tokenHash`: only `models/Session.ts` uses it, to look a session up. Prisma's error messages print a failed query's arguments, so the model scrubs bcrypt hashes from any error before rethrowing it, and `withLogger` redacts them again before the terminal and `logs/error.log` (`lib/redact.ts`).
- **Controllers** call the model functions, and **pages and server actions** call the controllers.
- **View components** only receive records as props. They import the `User`, `Announcement` and `JobPosting` *types*, never the models.

This is what kept the move to PostgreSQL small. The storage code lives in the two model files, which now call Prisma Client (`lib/prisma.ts`) instead of arrays. The model functions became asynchronous, so the only other change was an `await` in the controllers, pages and server actions that call them.

---

## ⚖️ Differences between this design and the current code

Nothing in this table is hidden or presented as done. "Current code" means the models, the API, the views, `prisma/schema.prisma` and the `init` migration as they are now.

| Item | Design (this document) | Current code |
| --- | --- | --- |
| Announcement body field | `message` | `message` in the database; still `content` in the API JSON, forms, views and Swagger. The model maps `content` ↔ `message`. |
| Announcement date field | `postedAt`, `timestamptz(3)`, default `now()` | `postedAt` in the database, set by `DEFAULT now()`; still `createdAt` (an ISO string) in the API JSON, views and Swagger. The model maps `createdAt` ↔ `postedAt`. |
| `job_postings.title` length | At most 120 characters (Week 7) | Checked only in the model (`400`); the column is still `text` with no length limit, and no migration was made for it |
| Announcement `author` | Not in the design | Not in the database. Still accepted by the API and the forms (and validated: it must be a non-empty string if sent), but **never stored and never returned**. Swagger and the form still show it. |
| `users.isAlumni` | `boolean`, required, default `false` | In the database; read by `UserModel.getAllWithStatus` and `getProfile` for the `/users` pages (Week 9); set by register (`true` for `ALUMNI`) and returned by `POST /api/register` (Week 10); not in `/api/users` or the `/users` forms (users created there get `false`) |
| `users.graduationYear` | `integer`, optional | In the database; read by `UserModel.getAllWithStatus` and `getProfile` for the `/users` pages (Week 9); set by register for `ALUMNI` and returned by `POST /api/register` (Week 10); not in `/api/users` or the `/users` forms |
| `users.age` | Optional since Week 10 | **Matches:** nullable in the database (migration `20261125065612_add_user_roles_and_passwords`). `/api/users` and the `/users` form still require it; registered users have none, and the API leaves the key out |
| Development seed | Fake data for development, run by `npx prisma db seed` | **Matches:** `prisma/seed.mts` with four Faker factories empties `sessions` too (everyone is logged out) and inserts 20 fake users, 5 fake announcements, 25 job postings and 30 applications into the database. The app shows these rows on its pages and in the API. |
| Where the app keeps data | PostgreSQL tables | **Matches:** the models use Prisma Client (`lib/prisma.ts`) with the pg adapter. The in-memory arrays and sample data are gone. |
| Email uniqueness | Unique | **Matches:** the database index `users_email_key` decides, and the API answers `409`. Emails are stored in lowercase, so the case-sensitive index works like a case-insensitive rule. Rows saved before this change (none after `npx prisma db seed`) could still have capital letters. |
| `age > 0` | Whole number greater than 0 | Checked only in the model; there is no `CHECK` constraint in the database |
| Form conversion of new fields | `isAlumni` would come from a checkbox, `graduationYear` from a number field | `formDataToObject` converts `age`, `userId`, `jobPostingId` and `graduationYear` (register, Week 10); nothing converts `isAlumni` from form text (register sets it from the role) |
| Image version | PostgreSQL with a fixed version | **Matches:** `docker-compose.yml` uses the exact tag `postgres:17.11-alpine` (until 2026-10-22 it was `postgres:17-alpine`, which fixed only the major version) |
| Hosted database | This design runs PostgreSQL 17 in Docker | The README's Upcoming list still names Supabase (hosted PostgreSQL) with Prisma as the database |
| `job_postings` table | `id`, `userId` (FK to `users.id`, `ON DELETE CASCADE`), `title`, `company`, `city`, `description`, `createdAt` | **In the database** (migration `20261021223924_add_job_postings_applications`), with `models/JobPosting.ts` and the API `GET`/`POST /api/users/:id/jobs` (the user comes from the URL). No update or delete endpoint yet; the `/users/:id` page shows a user's postings (read-only). |
| `applications` table | Links users and postings (many-to-many), `status` default `'applied'`, unique (`userId`, `jobPostingId`), `ON DELETE CASCADE` on both foreign keys | **In the database** (migration `20261021223924_add_job_postings_applications`), with `models/Application.ts` and the API `POST`/`GET /api/jobs/:id/applications` and `GET /api/users/:id/applications` (a repeated pair gives `409`). No update or delete endpoint and no pages yet. |
| Relationships and foreign keys | `users` 1–n `job_postings`; `users` n–m `job_postings` through `applications` | **Matches** in the database (three foreign keys, all `ON DELETE CASCADE`). The app uses them: `/api/users/:id` and the `/users/:id` page load a user with their job postings, and the application endpoints list applicants with their names and a user's applications with the posting. |
| `sessions` table, login and logout (Week 10) | `sessions` (`tokenHash`, `userId` FK with `ON DELETE CASCADE`, `expiresAt`, `createdAt`), a generic login error, 7-day sessions, an `httpOnly` cookie (see Login and sessions) | **Matches:** migration `20261125071955_add_sessions`, `models/Session.ts`, `lib/session.ts`, `UserModel.authenticate` (with a dummy bcrypt compare for an unknown email), the `/login` page, the Log out button in the header, and `POST /api/login`, `POST /api/logout`, `GET /api/me`. Not built: rate limiting, email verification, password reset |
| Separate Alumni table | Not in the design: alumni are users with `isAlumni` and `graduationYear` | Not in the code either. The old version of this document planned a separate `Alumni` table, and this design replaces that plan. |
| `users.role` (Week 10) | Enum `Role` (`ADMIN`, `ALUMNI`, `STUDENT`), required, default `STUDENT` | **Matches** in the database (migration `20261125065612_add_user_roles_and_passwords`; existing rows: user 1 `ADMIN`, else `ALUMNI` or `STUDENT` by `isAlumni`). Set by register and returned by `POST /api/register`; `/api/users` and the `/users` form give `STUDENT`. Changed by an admin on `/admin/users` or with `PATCH /api/users/:id/role`, and by `npm run make-admin` (Week 10); the seed makes no `ADMIN` any more. Not shown in `/api/users` |
| `users.passwordHash` (Week 10) | `text`, required, a bcrypt hash; never in any API or page output | **Matches:** in the database; hashed with `bcryptjs` (cost 10) by `UserModel.register`; read only by `UserModel.authenticate` to compare it, and never returned or logged. Existing and seeded rows have the hash of the **demo-only** password `homecoming-demo`; users created by `/api/users` or the `/users` form get the hash of a random, unknown password |
| Role permissions (Week 10) | `ADMIN` manages users, announcements and job postings; `ALUMNI` edits their own profile; everyone views the directory and applies (see the Roles section) | **Matches** (Week 10): the Access rules, from one map (`lib/access.ts`) and one guard (`lib/guard.ts`) used by every page, form and API endpoint, plus `proxy.ts` for the first check of pages. Applying always uses the session user |
| Admin panel and safety rules (Week 10) | `/admin` and `/admin/users`, admin only; an admin can't delete themselves; the last admin can't be demoted or deleted | **Matches:** `app/admin/`, `controllers/AdminController.ts`, `PATCH /api/users/:id/role`; the safety rules are in `UserModel.remove` and `UserModel.changeRole` (one transaction that locks the admin rows), so they also hold for `DELETE /api/users/:id` and the Delete button on `/users`. `/admin/announcements`, `/admin/jobs` and `/admin/applications` are still to come. The "last admin can't be deleted" rule can only be reached by a script: through the site, the only admin who could delete the last admin is that admin, and the self-delete rule stops it first |
| Register page and rules (Week 10) | Full name, email, password (8+), confirm password, role (`ALUMNI` or `STUDENT`), graduation year (`ALUMNI` only), optional school (see Register rules) | **Matches:** the `/register` page and `POST /api/register` both use `UserModel.register` (Week 10). The `/users` form and `/api/users` still create users with `fullName`, `email`, `age` and `school`, without a password of their own |

---

Back to [README.md](README.md)
