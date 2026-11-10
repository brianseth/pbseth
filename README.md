# PLUTO BOYZ GLOBAL - Backend

A small REST API for the [PLUTO BOYZ GLOBAL frontend](https://github.com/brianseth/PLUTO-BOYS-GLOBAL-frontend). It handles user registration, login, and token-protected routes.

## Features
- Register with username and password validation
- Passwords hashed with bcrypt (never stored in plain text)
- JWT login tokens that expire after 2 hours
- Rate limiting on auth routes (20 requests per 15 minutes)
- CORS restricted to the frontend's origin

## Tech stack
Node.js, Express, bcryptjs, jsonwebtoken, express-rate-limit, cors

## API

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | No | Create an account |
| POST | `/login` | No | Log in and receive a token |
| GET | `/me` | Bearer token | Return the logged-in user |

### POST /register
Request body:
```json
{ "username": "pluto_fan", "password": "at-least-8-chars" }
```
Responses: `201` account created, `400` invalid input, `409` username taken.

### POST /login
Request body:
```json
{ "username": "pluto_fan", "password": "at-least-8-chars" }
```
Responses: `200` with `{ "message": "...", "token": "..." }`, or `401` for invalid credentials.

### GET /me
Send the header `Authorization: Bearer <token>`. Returns `{ "username": "..." }`, or `401` if the token is missing or expired.

## Run locally
1. Clone the repo and install dependencies:
   ```
   git clone https://github.com/brianseth/pbseth.git
   cd pbseth
   npm install
   ```
2. Set environment variables and start the server:
   ```
   export JWT_SECRET="a-long-random-string"
