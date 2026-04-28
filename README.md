# Nest

A club discovery and recruitment platform for university students. Students can browse clubs, save favourites, submit applications, and track hiring timelines. Clubs manage their profile, review applicants, and update application statuses — all from a dedicated club-facing interface.

---

## Features

### Student side
- Browse and search clubs by category, recruiting status, and keyword
- Save clubs to a favourites list
- Submit applications with custom question responses and file uploads (PDF)
- Track application status
- View upcoming deadlines and interview dates on the hiring dashboard
- Leave ratings and written reviews for clubs

### Club side
- Set up and edit a public club profile (logo, backdrop, description, categories, social links, open positions, hiring timeline)
- Build a custom application form with short answer, long answer, and file upload questions
- View and manage incoming applications with status controls
- Analytics dashboard with application trends over time

---

## Tech stack

| Layer | Technology |
|---|---|
| Languages | JavaScript (ES2020+), SQL |
| Frontend | React 18, React Router v6, Recharts, Lucide React |
| Backend | Node.js, Supabase (Postgres, Auth, Storage, RLS) |

---

## Project structure

```
Nest-2/
├── client/
│   └── src/
│       ├── components/
│       │   ├── Home.js               # Student home page
│       │   ├── Search.js             # Club discovery + filtering
│       │   ├── Favorites.js          # Saved clubs
│       │   ├── ClubDetail.js         # Public club profile page
│       │   ├── ClubApplication.js    # Application form
│       │   ├── HiringDashboard.js    # Student application tracker
│       │   ├── UserProfile.js        # Student profile settings
│       │   ├── ClubDashboard.js      # Club home + application viewer
│       │   ├── ClubAnalytics.js      # Club applicant management
│       │   ├── ClubRegistration.js   # Club profile editor
│       │   ├── AdminDashboard.js     # Admin panel
│       │   ├── Sidebar.js            # Navigation sidebar
│       │   ├── ProtectedRoute.js     # Auth + role guards
│       │   ├── Login.js
│       │   └── Register.js
│       ├── contexts/
│       │   └── AuthContext.js        # Auth state + user merging
│       ├── lib/
│       │   └── db.js                 # All Supabase queries
│       └── supabaseClient.js
├── supabase/
│   └── schema.sql                    # Full database schema + RLS policies
└── server.js                         # Express server (legacy)
```

---

## Database tables

| Table | Purpose |
|---|---|
| `clubs` | Club profiles, hiring info, application questions |
| `profiles` | Extended user data (name, program, year, role) |
| `applications` | Student applications with answers and status |
| `favorites` | Many-to-many: users ↔ clubs |
| `reviews` | Student reviews and star ratings for clubs |

Row-level security is enabled on all tables. Storage buckets: `club-assets` (logos, backdrops), `avatars` (profile photos), `application-files` (PDF uploads).

---

## Getting started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone <repo-url>
cd Nest-2
npm install
cd client && npm install
```

### 2. Set up Supabase

1. Create a new Supabase project
2. Run `supabase/schema.sql` in the **SQL Editor** to create all tables, policies, and triggers
3. In **Storage**, create three public buckets: `club-assets`, `avatars`, `application-files`
4. Add storage RLS policies for each bucket (allow authenticated users to insert and select)

### 3. Configure environment

Create `client/.env.local`:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

### 4. Run

```bash
cd client && npm start
```

The app runs on `http://localhost:3000`.

---

## User roles

| Role | Access |
|---|---|
| `student` | Browse clubs, apply, track applications, write reviews |
| `club` | Manage club profile, view and action incoming applications |
| `admin` | Full access, can register clubs and view all users |

Role is set on the `profiles` table (`role` and `user_type` columns). The `handle_new_user` trigger auto-creates a profile on signup using metadata passed at registration.

---

## Theme

The UI uses a warm academic colour palette throughout:

| Token | Hex |
|---|---|
| Page background | `#faf7f2` |
| Accent | `#b5451b` |
| Card background | `#ffffff` |
| Card border | `#ede8df` |
| Primary text | `#2a1f14` |
| Muted text | `#a09180` |
| Sidebar background | `#f3ede3` |

Fonts: **Instrument Serif** (headings), **DM Sans** (body), **Space Grotesk** (labels/badges).
