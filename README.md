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

A typical layout for this project, following Next.js App Router conventions:

```
alumni-tracking-system/
├── app/
│   ├── api/
│   │   ├── alumni/
│   │   └── export/
│   ├── alumni/             # now renders dynamically (force-dynamic)
│   └── layout.tsx
├── components/
├── lib/
│   └── prisma.ts           # Prisma client, using DATABASE_URL (pooled)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts              # uses DATABASE_URL (pooled)
├── prisma7.config.ts        # Prisma CLI config, uses DIRECT_URL for migrations
├── public/
├── Dockerfile                # multi-stage build, Next.js `standalone` output
├── .dockerignore
├── docker-compose.yml
├── .env.example              # DATABASE_URL + DIRECT_URL placeholders
├── next.config.ts            # output: "standalone"
├── package.json
└── README.md
```
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
## 🏫 Course Information

- **Course:** Web Programming
- **Department:** Management Information Systems, Istanbul University
- **Student:** Anberin Ahmadi
- **Evaluation:** The instructor will select the student project that best demonstrates a working website to actually implement and use as the department's official alumni tracking platform.

---
## 📄 License

This project was developed for academic purposes as part of the Web Programming course at Istanbul University. It is not licensed for external use, redistribution, or commercial purposes without permission.# alumni
