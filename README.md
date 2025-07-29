# Hackaton_Codered_2025
for hackaton purpose 
Team members:Srikanth.S  Nishanth.P    Ramya Ramadoss    Gomathi Lakshmi G
Here’s a complete, professional `README.md` file for your StudySync project, designed for GitHub and suitable for hackathons, MVPs, and public demos.

# StudySync – Personalized Study Group Matcher

A modern, full-stack web app for discovering, creating, and matching student study groups by subject and schedule.

![StudySync Banner: Add an illustrative banner if you make one!) -->

## 🚀 Features

- **Landing Page:** Clean, inviting home with call-to-action
- **Google-style Authentication:** (Mock for demo, real OAuth ready)
- **Profile Setup:** Type-to-add courses, topics of interest, precise date+time study slots
- **Group Discovery:** Smart, schedule-aware, subject-matching with full/availability logic
- **Create Groups:** Custom subjects, time, capacity, and optional chat links
- **My Groups:** See, manage your groups
- **Admin Dashboard:** (Optional) Analytics and moderation
- **Responsive:** Mobile-first Tailwind UI
- **Real Persistence:** PostgreSQL on backend, localStorage fallback in frontend demo

## 💻 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, react-tailwindcss-datepicker, react-tag-input-component
- **Backend:** Node.js, Express, JWT Auth, PostgreSQL, node-cron (for scheduled cleanup)
- **Deployment:** Vercel (Frontend), Render/Heroku/Railway (Backend)
- **APIs:** REST

## 📦 Quickstart – Local Demo

### 1. Clone the repo

```bash
git clone https://github.com//studysync.git
cd studysync
```
(or split to `/studysync-frontend` and `/studysync-backend` as needed)

### 2. Backend Setup

```bash
cd studysync-backend
npm install
cp .env.example .env  # Fill in your DATABASE_URL and JWT_SECRET
# Initialize Postgres DB using init.sql
node index.js
```

### 3. Frontend Setup

```bash
cd ../studysync-frontend
npm install
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173).

## 🌟 Core User Flow

1. **Login/Register** (mock or real)
2. **Set up Profile:** Type courses, add topics, pick exact study slots (date+time).
3. **Create Groups** or **Discover Groups** matching your courses and times.
4. **Join Groups:** Live capacity/status shown—full slots mark as unavailable!
5. **My Groups:** Review/join chats.
6. **(Admin) Dashboard:** See analytics (requires admin flag in user profile for demo).

## ⚙️ Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Frontend (`.env`)
To proxy REST API if deployed separately:
```
VITE_API_URL=http://localhost:5000
```

## 🛠️ SQL Schema

See `init.sql` for table definitions of `users`, `groups`, and `group_memberships`.

## 🌍 Deployment

- **Frontend:** Vercel/Netlify—connect repo and deploy, no config needed.
- **Backend:** Render/Heroku/Railway—add Postgres DB and your env variables.
- Adjust CORS and API URLs as needed in production.

