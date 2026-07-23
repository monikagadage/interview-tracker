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