# EventFlow — Corporate Event Production & Experience Design

A full-stack platform for managing multi-day annual conferences: staging, audio/visual requirements, keynotes and sponsor integration.

**Standard stack:** Next.js (frontend) · Node.js + Express.js (backend) · MongoDB (database)

## Project structure

```
event-production-platform/
├── server/                 Express API
│   └── src/
│       ├── config/         env validation, DB connection
│       ├── models/         User, Event, Session, Sponsor (Mongoose)
│       ├── validators/     Zod schemas for all input
│       ├── middleware/     auth (JWT + roles), validate, error handling
│       ├── controllers/    business logic
│       ├── routes/         route table
│       ├── app.js          Express app (helmet, CORS, rate limiting, lazy DB connection)
│       ├── server.js       long-running entry point (local dev / traditional hosting)
│       └── seed.js         demo data
│   ├── api/index.js        Vercel serverless entry point (re-exports the Express app)
│   └── vercel.json         routes every request to api/index.js
└── client/                 Next.js (App Router)
    ├── app/                pages: /, /events/[id], /login, /register, /dashboard, /dashboard/events/[id]
    ├── components/         Navbar, EventCard, Schedule, SponsorList, AuthForm
    ├── context/            AuthContext
    └── lib/                API client, formatting helpers
```

Both folders are **independent Vercel projects** (two deployments from one repo).

## Running locally

Requires Node 20.9+ and a running MongoDB (local or Atlas).

```bash
# 1. API
cd server
cp .env.example .env        # set MONGODB_URI and a long random JWT_SECRET
npm install
npm run seed                # optional demo data (WIPES the target database)
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd client
cp .env.local.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

Demo logins after `npm run seed`:

| Role      | Email                  | Password        |
|-----------|------------------------|-----------------|
| Admin     | admin@example.com      | Admin1234       |
| Organizer | organizer@example.com  | Organizer1234   |
| Attendee  | attendee@example.com   | Attendee1234    |

## Deploying to Vercel

The API and the frontend are deployed as **two Vercel projects** from the same GitHub repo. Deploy the API first, because the frontend needs its URL.

### 0. MongoDB Atlas (once)
1. Create a free cluster and a database user (Database Access).
2. **Network Access → Add IP Address → Allow access from anywhere (`0.0.0.0/0`).** Vercel uses dynamic IPs, so this is required; without it every API call returns `503 Database is temporarily unavailable`.
3. Copy the connection string and put the database name in it, e.g. `mongodb+srv://USER:PASS@cluster.mongodb.net/event_production?retryWrites=true&w=majority`. URL-encode special characters in the password.

### 1. Deploy the API (`server`)
1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory: `server`**. Framework Preset: **Other**. Leave build/output settings empty.
3. Environment variables (Production, and Preview if you use it):

   | Name | Value |
   |------|-------|
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | long random string: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `NODE_ENV` | `production` |
   | `CLIENT_ORIGIN` | placeholder for now (e.g. `http://localhost:3000`); set the real frontend URL in step 3 |

4. Deploy, then open `https://<api-project>.vercel.app/api/health`. You should see `{"success":true,"status":"ok"}`.

### 2. Deploy the frontend (`client`)
1. **Add New → Project** → import the same repo again.
2. **Root Directory: `client`**. Framework Preset: **Next.js** (auto-detected).
3. Environment variable: `NEXT_PUBLIC_API_URL` = `https://<api-project>.vercel.app/api` (must end in `/api`, no trailing slash). It is baked in at **build** time, so changing it requires a redeploy.
4. Deploy.

### 3. Connect them (CORS)
In the **API** project set `CLIENT_ORIGIN` to the frontend's URL (e.g. `https://<client-project>.vercel.app`, no trailing slash; comma-separate multiple origins such as a custom domain) and **redeploy the API** so the change takes effect.

### 4. Seed demo data (optional)
From your machine, with `MONGODB_URI` pointing at Atlas in `server/.env`: `cd server && npm run seed`. This **wipes** users, events, sessions and sponsors in that database. Change or delete the demo accounts before real use.

### Troubleshooting
| Symptom | Cause / fix |
|---|---|
| Frontend shows "Failed to fetch" / CORS error | `CLIENT_ORIGIN` on the API doesn't exactly match the frontend origin, or the API wasn't redeployed after changing it |
| API returns `503 Database is temporarily unavailable` | Atlas Network Access doesn't allow `0.0.0.0/0`, or `MONGODB_URI` has a wrong password/db name |
| API returns 500 `FUNCTION_INVOCATION_FAILED` | `MONGODB_URI` or `JWT_SECRET` missing (see the function logs in Vercel) |
| Frontend calls `localhost:5000` in production | `NEXT_PUBLIC_API_URL` wasn't set before the build; set it and redeploy |
| 404 on every API route | API project's Root Directory isn't `server` |

Serverless notes: the MongoDB connection is cached per warm instance; rate-limit counters are per instance (they slow abuse but are not a global limit).

## What it does

- **Events** with venue, dates, status (draft / published / completed) and stages, each with capacity and A/V requirements.
- **Schedule** of sessions (keynote, talk, workshop, panel, break, networking) with speakers and per-session A/V notes. The API rejects sessions that fall outside the event dates and sessions that double-book a stage.
- **Sponsors** with tier, booth and integration deliverables.
- **Public site** shows published events only; organizers manage their own events from the dashboard.

## API

All routes are under `/api`.

| Method | Route | Access |
|--------|-------|--------|
| POST | `/auth/register`, `/auth/login` | public (rate limited) |
| GET | `/auth/me` | signed in |
| PATCH | `/users/:id/role` | admin |
| GET | `/events` (`?mine=true`, `?page`, `?limit`) | public (published only) / organizer (own) |
| GET | `/events/:id` | public if published, otherwise owner/admin |
| POST | `/events` | organizer, admin |
| PATCH, DELETE | `/events/:id` | event owner or admin |
| GET | `/events/:eventId/sessions`, `/sponsors` | public |
| POST, PATCH, DELETE | `/events/:eventId/sessions[/:id]`, `/sponsors[/:id]` | event owner or admin |

Responses are JSON: `{ success: true, ... }` on success and `{ success: false, message, details? }` on error.

## Security and quality notes

- Passwords hashed with bcrypt (cost 12); JWT bearer auth; role is never accepted from registration input. Promote users via `PATCH /users/:id/role` (admin) or the seed script.
- Every request body, query and param is validated with Zod; unknown fields are stripped.
- Ownership is enforced server-side on every write to events, sessions and sponsors.
- Helmet, CORS allow-list (`CLIENT_ORIGIN`), request size limit, global and auth-specific rate limits (proxy-aware via `trust proxy`).
- Centralised error handler; internal error details are hidden in production.
- The token is kept in `localStorage` for simplicity. For production, consider httpOnly cookies.

## Quality checks

```bash
cd server && npm test && npm run check     # Jest unit/API tests, syntax check
cd client && npm run lint && npm run build # ESLint (flat config) and production build
```

GitHub Actions (`.github/workflows/ci.yml`) runs all of the above on Node 20 and 22.

## Suggested next steps

Edit forms for sessions and sponsors, attendee registration/ticketing, httpOnly-cookie auth, end-to-end tests (Playwright), and a shared rate-limit store (e.g. Upstash Redis) if you need global limits on Vercel.
