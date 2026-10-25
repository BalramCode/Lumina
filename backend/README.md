# Lumina Backend

This directory contains the independently runnable Lumina Express API. It connects to MongoDB before listening for requests and currently exposes a health-check endpoint only. Authentication and frontend integration are intentionally out of scope for this step.

## Requirements

- Node.js 18 or later
- npm

## Install and configure

From this directory in PowerShell:

```powershell
npm.cmd install
Copy-Item .env.example .env
```

`PORT` defaults to `5000` and `NODE_ENV` defaults to `development` when omitted. Valid `NODE_ENV` values are `development`, `test`, and `production`.

Set `MONGODB_URI` in `backend/.env`. Existing deployments using `MONGO_URI` continue to work; the backend maps that value internally without copying it. The server will not start until MongoDB is connected.

## Start the API

For development with automatic restarts:

```powershell
npm.cmd run dev
```

For a production-style start:

```powershell
npm.cmd start
```

The local API URL is `http://localhost:5000` unless `PORT` is changed.

## Verify the health check

With the server running:

```powershell
curl.exe -i http://localhost:5000/api/v1/health
```

Expected response: HTTP `200` with JSON similar to:

```json
{
  "status": "ok",
  "message": "Lumina API is running",
  "environment": "development",
  "database": {
    "status": "connected"
  }
}
```

An unknown API route returns JSON with HTTP `404`:

```powershell
curl.exe -i http://localhost:5000/api/v1/unknown
```

## Register a user

The registration endpoint does not log a user in or return a token.

```powershell
curl.exe -i -X POST http://localhost:5000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Example User","email":"example@example.test","password":"replace-with-a-unique-password","role":"parent","guardianConsent":true}'
```

Allowed roles are `parent`, `therapist`, `educator`, and `mentor`. The API requires a name, valid email address, password of at least eight characters, role, and an affirmative `guardianConsent` value. It rejects `admin` and does not return password data.
