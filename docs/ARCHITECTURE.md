# UAS-RTMVD — Architecture

## Overview

The UAS-RTMVD (Upper Air Sounding Real Time Monitoring Visualization Dashboard) application is a **modular monolithic** web application built on the MERN stack. It follows Model-View-Controller (MVC) principles on the backend and a feature-based component architecture on the frontend.

---

## High-Level Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        Browser Client                        â”‚
â”‚  React + Vite + Tailwind + Recharts + Socket.IO Client       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                        â”‚  HTTP (REST API + cookies)
                        â”‚  WebSocket (Socket.IO)
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     Node.js / Express                        â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  Routes  â”‚ â”‚Controllers â”‚ â”‚ Services  â”‚ â”‚  Middleware â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚              Socket.IO Server (data-collection)      â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                        â”‚  Mongoose ODM
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        MongoDB                               â”‚
â”‚  Collections: users, observations, datacollections,          â”‚
â”‚               auditlogs                                      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Backend Architecture (MVC)

The backend follows a standard MVC architecture:

```text
server/src/
├── collectors/      # Data ingestion (LAN receiver, simulators)
├── config/          # Environment and database configuration
├── controllers/     # Request handlers mapping to routes
├── middleware/      # Express middlewares (auth, validation)
├── models/          # Mongoose ODM schemas
├── routes/          # API route definitions
├── scripts/         # Maintenance and seeding scripts
├── services/        # Core business logic
├── sockets/         # WebSocket event handling
├── utils/           # Shared utility functions
├── validators/      # Zod validation schemas
├── app.js           # Express app setup
└── server.js        # Server entrypoint
```

## Data Collection Architecture

The data collection subsystem is designed around a **data source interface**:

```
IDataSource {
  start(sessionId, onObservation, onError): void
  stop(): void
  getSourceName(): string
}
```

The `SimulatorDataSource` implements this interface and generates plausible atmospheric observations. A real hardware adapter (e.g., RS41 radiosonde interface) can implement the same interface and be plugged in without modifying the core collection service.

---

## Frontend Architecture

```
src/
â”œâ”€â”€ context/        â€” React context providers (AuthContext, SocketContext)
â”œâ”€â”€ hooks/          â€” Custom hooks (useAuth, useSocket, useObservations, ...)
â”œâ”€â”€ services/       â€” Axios API service functions by domain
â”œâ”€â”€ features/       â€” Feature folders (auth, dashboard, observations, users)
â”œâ”€â”€ components/     â€” Reusable UI components (common, charts, layout)
â”œâ”€â”€ pages/          â€” Route-level page components
â””â”€â”€ routes/         â€” Route definitions with protected route wrapper
```

### Authentication Flow

1. User submits login form â†’ POST /api/v1/auth/login
2. Server validates credentials, issues JWT in HTTP-only cookie
3. Frontend stores user object in AuthContext (not the token)
4. All subsequent API requests automatically include the cookie
5. On 401 response, frontend redirects to /login

---

## Security Architecture

| Concern | Implementation |
|---------|----------------|
| Authentication | JWT in HTTP-only, SameSite=Strict cookie |
| Authorization | Role-based middleware on every protected route |
| Input validation | Zod schemas on body, query, params |
| Rate limiting | express-rate-limit on /auth/login |
| Headers | Helmet with sensible defaults |
| CORS | Explicit origin whitelist |
| Password storage | bcrypt (cost factor 12) |
| Error messages | Operational errors exposed; internal errors suppressed |
| Logging | Pino structured logger; no secrets logged |
| NoSQL injection | Mongoose sanitizeFilter option enabled |

---

## Real-Time Communication

Socket.IO is used for server-push events. The client never emits events that affect data integrity.

**Events emitted by the server:**

| Event | Payload | Description |
|-------|---------|-------------|
| `observation:new` | Observation object | New observation saved |
| `collection:started` | Session object | Collection session started |
| `collection:stopped` | Session object | Collection session stopped |
| `collection:status` | `{ sessionId, status }` | Periodic status update |

**Socket authentication:**  
On connection, the client sends no token â€” the server reads the HTTP-only cookie from the socket handshake headers and validates it before allowing the connection.



