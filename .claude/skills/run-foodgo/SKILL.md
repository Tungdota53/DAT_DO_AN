---
name: run-foodgo
description: Build, run, start, test, drive, and screenshot FoodGo. Use for launching its Express API, Vite UI, SQL Server flow, admin page, or browser smoke test.
---

FoodGo is a Windows Node monorepo with Express, React/Vite, and SQL Server. Drive full app through `.claude/skills/run-foodgo/smoke.mjs`; it launches both services, exercises live database and browser UI, writes screenshot, then stops all child processes.

All paths below are relative to repository root.

## Prerequisites

Verified on Windows 11 with Node `v24.16.0`, npm `11.13.0`, Google Chrome, SQL Server service `MSSQLSERVER`, and 64-bit `ODBC Driver 18 for SQL Server`.

`backend/.env` and `frontend/.env.local` must exist. Backend defaults to database `DatDoAnOnline` through Windows Trusted Connection. Database schema and seed must already contain `Bếp Việt` as restaurant ID `1` because smoke driver follows that seeded record.

## Setup

```powershell
npm install
```

## Build

```powershell
npm run build
```

## Run (agent path)

Run self-contained smoke driver from a fresh shell with ports `3000`, `5173`, and `9222` free:

```powershell
node .claude/skills/run-foodgo/smoke.mjs
```

Driver verifies:

- `GET http://localhost:3000/api/health`
- live SQL query through `GET /api/restaurants?page=1&limit=1`
- `http://localhost:5173/` and `http://localhost:5173/admin`
- homepage render containing `Bếp Việt`
- click `Xem thực đơn Bếp Việt`
- detail route `/restaurants/1`, heading, and food-search input
- no browser exceptions, log errors, failed HTTP responses, or failed requests

Artifacts:

- Screenshot: `.tmp/run-foodgo/foodgo-smoke.png`
- Result: `.tmp/run-foodgo/smoke-result.json`
- Logs: `.tmp/run-foodgo/backend.log`, `.tmp/run-foodgo/frontend.log`, `.tmp/run-foodgo/chrome.log`

Inspect screenshot before reporting success.

## Run (human path)

Use two terminals. Keep each command running; press `Ctrl+C` in both to stop.

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

Open `http://localhost:5173/`; API base is `http://localhost:3000/api`; admin page is `http://localhost:5173/admin`.

## Test

```powershell
npm run type-check
npm run lint
npm run test
npm run build
```

## Gotchas

- Smoke flow depends on seeded `Bếp Việt` ID `1`; unseeded or modified local catalog makes driver fail loudly.
- Driver refuses occupied ports instead of killing unrelated processes.
- `npm run dev:frontend -- --host 127.0.0.1` passed `127.0.0.1` as Vite root under npm `11.13.0`; use plain `npm run dev:frontend`.
- `chromium-cli` was unavailable in verified environment. Driver uses installed Chrome/Edge through DevTools Protocol, so no Playwright dependency needed.
- Vite serves no `/favicon.ico`, producing one browser 404; driver ignores only that exact optional asset while failing on every other HTTP/browser error.
- PowerShell variable `$HOME` is read-only; avoid reusing it for HTTP response data.

## Troubleshooting

- **`'tsx' is not recognized` or `'vite' is not recognized`**: dependencies are absent or incomplete. Run `npm install`, then rerun driver.
- **`Cổng 3000/5173/9222 đang được sử dụng`**: stop existing backend, frontend, or Chrome debug process; rerun driver.
- **`Không tìm thấy Chrome hoặc Edge`**: install Google Chrome or Microsoft Edge in standard Windows path.
- **SQL API returns an error**: verify `MSSQLSERVER` runs, `ODBC Driver 18 for SQL Server` is installed, and `backend/.env` points to `DatDoAnOnline`.
- **`EPERM` cleanup warnings during `npm install`**: stale native modules are locked by prior Node/Vite processes. Stop those processes and rerun install if executable links remain missing.
