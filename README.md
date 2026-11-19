# Automated Resume Builder with Resume Analysis

A full-stack resume builder with **rule-based** resume analysis (no ML, no AI generation), JWT
authentication, resume CRUD, PDF export, and a score-driven analysis dashboard with history.

## Stack

- **Backend**: Spring Boot 4.1.1 (Java 21, Maven wrapper), Spring Security + JWT (jjwt 0.12.6),
  Spring Data JPA, OpenPDF 1.3.43 for PDF export.
- **Frontend**: React 18 + Vite 5, react-router-dom.
- **Databases**: Persistent file-based H2 (default dev profile, survives restarts), plus
  ready-to-use MySQL, PostgreSQL and Supabase profiles. The MySQL, PostgreSQL and Supabase
  runtime drivers are already on the classpath.

## Project layout

```
finalproj/
├── backend/                  Spring Boot REST API (com.resumebuilder)
│   ├── auth/                 register / login / me / profile / password + JWT
│   ├── resume/               resume CRUD + item entities + status derivation
│   ├── analysis/             rule engine, analyzer, keyword service, history
│   ├── pdf/                  OpenPDF export (ResumePdfService + controller)
│   ├── template/             resume template catalog (seeded, 6 templates)
│   ├── security/             JWT filter + token service
│   └── config/               SecurityConfig + DataSeeder
└── frontend/                 React/Vite SPA (Vercel-ready)
    └── src/
        ├── components/       Layout, ui primitives, Icon set, A4 preview
        ├── pages/            14 screens (see below)
        ├── api.js            typed API client
        ├── auth.jsx          AuthProvider (login/register/profile/theme)
        ├── hooks.js          useResume, useReport
        ├── format.js         date / relative-time helpers
        └── index.css         design tokens + all component styles
```

## Screens

| Route | Screen |
| --- | --- |
| `/` | Landing (public, or Dashboard when signed in) |
| `/login` | Login |
| `/signup` | Sign up |
| `/forgot-password` | Request a password reset link |
| `/reset-password` | Set a new password using a reset link |
| `/resumes` | My Resumes — grid, search, status filters, pagination, delete |
| `/templates` | Templates — six seeded templates with mini previews |
| `/builder/:id` | Resume Builder — six-step editor with live A4 preview |
| `/analysis` | Resume Analysis hub — per-resume status, score, run actions |
| `/analysis/:id` | Analysis dashboard — score ring, summary cards, section table |
| `/analysis/:id/details` | Detailed analysis — Overview / Keywords / Formatting / Sections tabs |
| `/analysis/:id/job-description` | Analyze against a pasted job description |
| `/analysis/:id/reanalyze` | Make changes and re-analyze — before/after score comparison |
| `/analysis/:id/export` | Export resume — PDF download and pre-flight checks |
| `/history` | Analysis History — filterable run log, stored report lookup |
| `/profile` | Profile Settings — name, theme, password, session |

## Run it

### Backend (port 8080)

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Seeds 6 resume templates on startup. Data is stored in `backend/data/` (file-based H2) and
survives restarts. H2 console: `http://localhost:8080/h2-console`
(JDBC URL `jdbc:h2:file:./data/resumebuilder`, user `sa`, empty password).

To use MySQL, PostgreSQL or Supabase instead:

```powershell
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql      # or: postgres / supabase
```

Set `DB_URL`, `DB_USERNAME` and `DB_PASSWORD` for MySQL/PostgreSQL. For Supabase set
`SUPABASE_DB_URL`, `SUPABASE_DB_USERNAME` and `SUPABASE_DB_PASSWORD` — the URL is the
project's session-pooler JDBC string, for example
`jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres`, and the password is
the database password chosen when the Supabase project was created. SSL is required
automatically.

### Frontend (port 5173)

```powershell
cd frontend
npm install
npm run dev
```

`vite.config.js` proxies `/api` → `http://localhost:8080`, so no CORS setup is needed locally.
Open http://localhost:5173, register a user, build a resume, then hit **Analyze**.

## Analysis engine

Six independent rules produce a weighted 0-100 score. The section order is fixed by
`ResumeAnalyzer` and the maximum points total exactly 100:

| Section | Max | What it checks |
| --- | --- | --- |
| Personal Information | 15 | name, email, phone, location, LinkedIn, GitHub/portfolio, summary length |
| Education | 10 | entries, school/degree, dates, GPA, description |
| Experience | 20 | entries, title+company, dates, bullets per role, action verbs, quantification, filler phrases, keywords |
| Skills | 15 | technical depth, breadth, soft skills, languages, keyword coverage |
| Projects | 15 | entries, name+link, dates, description quality, tech stack, keywords |
| Formatting | 25 | penalties for missing name, bad email/phone/URL, missing dates, long bullets, over-long summary, empty sections |

Section status thresholds: **Complete** ≥ 90%, **Good** ≥ 70%, **Needs Improvement** ≥ 40%,
**Missing** below that or when the section is empty.

Keyword extraction (`KeywordService`) is fully deterministic: a fixed technology dictionary is
matched on whole words (longest phrase first, so "Spring Boot" wins over "Spring"), then
remaining non-stop-word tokens appearing at least twice are ranked by frequency, capped at 15.
Matching against the resume is literal and case-insensitive. No model inference is involved.

Resume status: `DRAFT` (never analyzed), `ANALYZED` (score < 80), `COMPLETED` (score ≥ 80).

## API surface

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | `{fullName, email, password}` → `{token, user}` |
| POST | `/api/auth/login` | `{email, password}` → `{token, user}` |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/auth/profile` | Update full name |
| PUT | `/api/auth/password` | Change password (current/new/confirm) → 204 |
| POST | `/api/auth/forgot-password` | `{email}` → `{resetUrl, expiresInMinutes}` (null URL when the email is unknown); email delivery is not configured, so the reset link is returned by the API instead |
| POST | `/api/auth/reset-password` | `{token, newPassword, confirmPassword}` → 204; tokens are single-use and expire after 30 minutes |
| GET | `/api/templates` | Resume template catalog |
| GET | `/api/resumes` | Resume summaries for the current user |
| POST | `/api/resumes` | Create a resume |
| GET/PUT/DELETE | `/api/resumes/{id}` | Read / update / delete one resume |
| GET | `/api/resumes/{id}/pdf` | Download resume as PDF (mirrors the on-screen A4 preview, styled per template: modern, classic, professional, minimal, elegant, simple) |
| POST | `/api/resumes/{id}/analysis` | Run analysis (optional `{jobTitle, jobDescription}`), store history |
| GET | `/api/resumes/{id}/analysis` | Latest stored report, or 404 if never run |
| GET | `/api/resumes/{id}/analysis/previous` | Report before the latest run, or null |
| GET | `/api/analysis/history` | All runs for the current user |
| GET | `/api/analysis/history/{id}` | One stored run with its full report |

All `/api/resumes*`, `/api/analysis*` and `/api/auth/me` endpoints require
`Authorization: Bearer <token>`. Every resume and history query is scoped to the authenticated
user, and deleting a resume also removes its stored analysis runs.

## Configuration

Backend config lives in `backend/src/main/resources/application.yml`:

- `app.jwt.secret` — JWT signing secret (override before production)
- `app.jwt.expiration-ms` — token lifetime (default 24h)
- `spring.jpa.hibernate.ddl-auto` — `update`, so the file-based H2 schema in `backend/data/`
  evolves with the entities instead of being dropped on shutdown

Frontend config:

- `VITE_API_BASE` — API base URL; defaults to `/api` and is proxied in dev
  (see `frontend/.env.example`).

Deployment:

- **Frontend**: deploy `frontend/` to Vercel. `vercel.json` rewrites all routes to the SPA.
- **Backend**: package with `.\mvnw.cmd -DskipTests package`, run the jar, and point
  `VITE_API_BASE` at the hosted API.

## Notes

- The UI uses no gradients, photos or illustrations. The score ring is drawn with an SVG
  stroke arc and loading placeholders use a solid fill with an opacity pulse.
- Dark theme is a token override under `[data-theme='dark']`; the A4 document preview stays
  light because it represents printed paper.
"# resumebuilderproj" 
