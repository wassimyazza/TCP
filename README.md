# TCP – Typing Competition Platform

A full-stack real-time multiplayer typing competition platform where players race to type passages as fast and accurately as possible, compete in championships, and track their progress over time.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11, MongoDB (Mongoose), Socket.IO, Passport JWT |
| Frontend | Next.js 16, React 19, Zustand, Tailwind CSS |
| Auth | JWT access tokens + bcrypt password hashing |
| Real-time | Socket.IO WebSocket gateway |
| Deployment | Docker + docker-compose |
| CI/CD | GitHub Actions |

## Features

- **🎯 Typing Test** — Solo free-play mode with live WPM and accuracy tracking
- **⚡ Multiplayer** — Real-time races with up to N players via WebSocket rooms and lobby matchmaking
- **🏆 Championships** — Bracket-based tournament system with group stages and auto-advance rounds
- **📊 Statistics** — Personal WPM trends, accuracy history, race history, and a global leaderboard
- **👤 Auth** — Register, login, JWT-protected routes, avatar upload, refresh token rotation
- **🌍 i18n** — French, English, and Arabic locale support (RTL for Arabic)
- **🛡️ Admin Panel** — User management (ban/unban/promote), text management, platform analytics
- **🐳 Docker** — One-command full-stack deployment

## Project Structure

```
TCP/
├── tcp-backend/          # NestJS API
│   ├── src/
│   │   ├── auth/         # JWT auth, strategies, guards
│   │   ├── users/        # User CRUD, profiles, avatars
│   │   ├── races/        # Solo & multiplayer race logic, Socket.IO gateway
│   │   ├── championships/# Tournament brackets, rounds
│   │   ├── groups/       # Group stages
│   │   ├── texts/        # Typing passage management
│   │   ├── stats/        # Aggregated stats, leaderboard
│   │   └── admin/        # Admin-only routes and management
│   └── test/             # End-to-end tests
└── tcp-frontend/         # Next.js app
    ├── app/              # App router pages (race, stats, championships, admin, auth)
    ├── components/       # Reusable UI components
    ├── store/            # Zustand state stores
    ├── lib/              # API client, Socket.IO wrapper, i18n config
    └── messages/         # Locale files (fr.json, en.json, ar.json)
```

