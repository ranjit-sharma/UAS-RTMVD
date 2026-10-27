# UAS-RTMVD — API Reference

> Version: v1  
> Base URL: `http://localhost:5000/api/v1`  
> All authenticated endpoints require a valid HTTP-only cookie set by `POST /auth/login`.

---

## Authentication

### POST /auth/register
Creates a new viewer account and sets an HTTP-only JWT cookie. Public
registration cannot create admin or operator accounts.

**Request body:**
```json
{
  "name": "New User",
  "email": "user@example.com",
  "password": "your-password"
}
```

The password must contain 8–128 characters. The new account is signed in
immediately after creation.

### POST /auth/login
Authenticates a user and sets an HTTP-only JWT cookie.

**Request body:**
```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Response 401:** Invalid credentials.  
**Response 429:** Too many login attempts.

---

### POST /auth/logout
Clears the auth cookie and invalidates the session.

**Response 200:**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### GET /auth/me
Returns the currently authenticated user.

**Response 200:**
```json
{
  "success": true,
  "message": "Authenticated",
  "data": { "id": "...", "name": "...", "email": "...", "role": "..." }
}
```

---

## Users (Admin only)

### GET /users
Returns a paginated list of users.

**Query params:** `page`, `limit`, `role`, `isActive`

**Response 200:**
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

### POST /users
Creates a new user. Admin only.

**Body:** `name`, `email`, `password`, `role`

### PATCH /users/:id
Updates user fields. Admin only.

### DELETE /users/:id
Deactivates a user (soft delete). Admin only.

---

## Observations

### GET /observations
Returns paginated, filtered observations.

**Query params:** `page`, `limit`, `startDate`, `endDate`, `minAltitude`, `maxAltitude`, `source`, `sortBy`, `sortOrder`

### GET /observations/:id
Returns a single observation by ID.

### POST /observations
Creates a new observation. Admin or Operator.

### PATCH /observations/:id
Updates an observation. Admin or Operator.

### DELETE /observations/:id
Deletes an observation. Admin only.

### GET /observations/export
Exports observations as CSV. Admin or Operator.

**Query params:** Same as GET /observations (with a max of 10,000 records).

---

## Data Collection

### GET /collections
Returns paginated collection sessions.

### GET /collections/:id
Returns a single session.

### POST /collections/start
Starts a new simulated data collection session. Admin or Operator.

**Body:** `sessionName` (optional)

### POST /collections/:id/stop
Stops a running session. Admin or Operator.

---

## Dashboard

### GET /dashboard/summary
Returns aggregate statistics (total observations, active session, last recorded timestamp).

### GET /dashboard/latest
Returns the most recent N observations for charting.

---

## Audit Logs (Admin only)

### GET /audit-logs
Returns paginated audit log entries.

**Query params:** `page`, `limit`, `userId`, `action`, `resource`, `startDate`, `endDate`

---

## Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "details": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

HTTP status codes used:
- `200` OK
- `201` Created
- `400` Bad Request (validation)
- `401` Unauthorized (not authenticated)
- `403` Forbidden (not authorized)
- `404` Not Found
- `409` Conflict (duplicate)
- `429` Too Many Requests
- `500` Internal Server Error
