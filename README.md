# Interview Question Tracker

A full-stack app for logging coding interview problems (sourced from places like
Prachub and 1point3acres) with per-user accounts and spaced-repetition revision
scheduling. Rate your confidence after solving a problem and the app schedules
when to revisit it — 1, 3, 7, or 14 days out — so you spend study time on the
problems you're actually shaky on.

## Features

- Email/password authentication with hashed passwords and JWT tokens
- Per-user private problem lists (no user can see another user's data)
- Log a problem with its name, source link, company tag, and topic/pattern
- Spaced-repetition scheduling: rate confidence (Again / Hard / Good / Easy)
  and the next review date is calculated automatically
- Filter by "Due today," "Due in 2 days," "Due in 7 days," or "All"
- Clickable links back to the original problem source

## Tech stack

**Backend**
- Python, FastAPI
- SQLAlchemy ORM, SQLite (dev) / PostgreSQL (production-ready)
- JWT authentication (`python-jose`), password hashing (`passlib` + bcrypt)

**Frontend**
- React (Vite)
- Tailwind CSS
- Fetch API for backend communication

## Project structure

interview-tracker-project/
├── backend/
│ ├── main.py # FastAPI app, routes, CORS config
│ ├── models.py # SQLAlchemy models (User, Problem)
│ ├── database.py # DB connection/session setup
│ ├── auth.py # Password hashing, JWT creation/validation
│ └── requirements.txt
└── frontend/
├── src/
│ ├── App.jsx # Main app: auth screen + tracker UI
│ └── ...
└── package.json


## Running locally

**Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`.

## How the spaced repetition works

When you mark a problem's confidence after solving it, the next review date is
set relative to today:

| Confidence | Next review |
|---|---|
| Again | 1 day |
| Hard | 3 days |
| Good | 7 days |
| Easy | 14 days |

This is a simplified version of the algorithm used by spaced-repetition tools
like Anki — problems you're shaky on resurface sooner, problems you know well
get pushed further out.

## Roadmap

- [ ] Deploy backend (Render) and frontend (GitHub Pages/Vercel)
- [ ] Delete/edit problem entries
- [ ] Export data as CSV

**Live app:** https://monikagadage.github.io/interview-tracker/
**Live API docs:** https://interview-tracker-api-kn5y.onrender.com/docs

> Note: the backend is on Render's free tier, which spins down after 15 minutes
> of inactivity. The first request after a while may take 30–50 seconds to
> wake up — that's expected, not a bug.