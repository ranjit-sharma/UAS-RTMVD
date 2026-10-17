# UASS Monitoring System.

UASS Monitoring System is a full-stack web application for monitoring Upper Air
Sounding System telemetry. It provides authenticated dashboards for live
atmospheric observations, sounding sessions, flight tracking, historical
analysis, CSV export, user administration, and audit review.

The repository contains a React/Vite client and an Express/MongoDB server. The
application can run with the built-in simulator or accept telemetry from
external equipment over UDP/TCP LAN listeners.

> **Development status:** The simulator is ready for local development and
> demonstration. Hardware ingestion is implemented as a telemetry receiver,
> but the application does not include a device-specific radiosonde driver.

## project live
[https://uass-monitoring-system.onrender.com]


## Features

- Dashboard summary and latest-observation views
- Live monitoring with Socket.IO observation updates
- Temperature, pressure, humidity, altitude, and wind visualizations
- Flight tracking and map-based telemetry display
- Historical observation filtering, pagination, editing, deletion, restoration,
  and CSV export
- Start/stop simulated data-collection sessions
- Optional UDP and TCP telemetry ingestion for instrument data
- JWT authentication stored in an HTTP-only cookie
- Public viewer account creation from the login page
- `admin`, `operator`, and `viewer` roles
- Admin-only user management and audit-log views
- Request validation with Zod and consistent API error responses
- Helmet security headers, CORS, body-size limits, and login rate limiting
- Light/dark theme support and responsive layout

## Technology stack

### Client

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 4
- Axios
- Socket.IO Client
- Recharts
- React Leaflet and Leaflet
- React Hook Form and Zod
- Vitest and React Testing Library

### Server

- Node.js 20.19.0 or newer
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens and bcrypt
- Socket.IO
- Zod
- Helmet, CORS, cookie-parser, and express-rate-limit
- Pino structured logging
- Jest and Supertest

## Architecture

```text
Browser (React/Vite)
        │
        ├── REST API with HTTP-only JWT cookie
        └── Authenticated Socket.IO connection
                 │
         Express + Socket.IO server
                 │
        ┌────────┼─────────┐
        │        │         │
     MongoDB  Simulator  LAN receivers
                         UDP :5001
                         TCP :5002
```

The server is organized into routes, controllers, services, models,
validators, middleware, and collectors. A collection session writes validated
observations to MongoDB and broadcasts `collection:started`,
`collection:stopped`, and `observation:new` events to authenticated clients.

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the detailed design,
[docs/API.md](./docs/API.md) for the REST API, and
[docs/DATA_FORMAT.md](./docs/DATA_FORMAT.md) for observation and telemetry
formats.

## User roles

| Role | Access |
| --- | --- |
| `admin` | All dashboards, collections, observations, user management, and audit logs |
| `operator` | Dashboards, live monitoring, tracking, observations, and collection control |
| `viewer` | Dashboards, live monitoring, tracking, and read-only observations |

Authorization is enforced by the server as well as by the client navigation.
The first admin account must be created with the interactive seed command.

## Prerequisites

- Node.js 20.19.0+
- npm
- A reachable MongoDB Atlas deployment
- A modern browser

The default development ports are:

| Service | Port |
| --- | ---: |
| Vite client | `5173` |
| Express API and Socket.IO | `5000` |
| UDP instrument receiver | `5001` |
| TCP instrument receiver | `5002` |

## Installation

Clone the repository and install dependencies for both packages:

```bash
git clone <repository-url>
cd UASS-Monitoring-System

cd server
npm install

cd ../client
npm install
```

On Windows PowerShell, the same commands work with the normal `cd` command.
Keep the server and client in separate terminals when running them.

### Configure the server

Copy `server/.env.example` to `server/.env` and set values appropriate for
your environment:

```dotenv
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority
MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1
JWT_SECRET=replace_with_a_strong_random_secret_at_least_32_chars
JWT_EXPIRES_IN=8h
COOKIE_NAME=uass_auth
CLIENT_URL=http://localhost:5173
SIMULATOR_INTERVAL_MS=3000
```

`MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `COOKIE_NAME`, and `CLIENT_URL`
are required. In production, `JWT_SECRET` must contain at least 32
characters. `MONGODB_DNS_SERVERS` is optional and defaults to Google DNS and
Cloudflare DNS to support networks whose default resolver cannot resolve Atlas
SRV records. Never commit `.env` files or real credentials.

### Configure the client

Copy `client/.env.example` to `client/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

When using the Vite development server, `/api` is also proxied to
`http://localhost:5000`.

## Create the first admin user

Make sure MongoDB is running, then run the interactive server seed script:

```bash
cd server
npm run seed
```

The script asks for the admin name, email, and password. Passwords must be at
least eight characters. This command creates an administrator; it does not
expose an HTTP endpoint.

To insert sample observation records for development:

```bash
npm run seed:observations
```

## Run the application

Start the API and Socket.IO server:

```bash
cd server
npm run dev
```

Start the React development server in a second terminal:

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and sign in with the
admin account created above.

For a production-style client preview:

```bash
cd client
npm run build
npm run preview
```

The server can be started without nodemon using `npm start` from `server/`.

## Deploying on Render

Because this repository contains a separate frontend and backend, deploy it as
two Render services backed by a MongoDB deployment such as MongoDB Atlas.

### 1. Deploy the backend API

Create a **Web Service** from the repository with these settings:

| Setting | Value |
| --- | --- |
| Root Directory | `server` |
| Runtime | `Node` |
| Environment Variable | `NODE_VERSION=20.19.0` |
| Build Command | `npm install` |
| Start Command | `npm start` |

If you leave the Render Root Directory empty, the repository root now supports
the same commands: `npm install` installs the root package, `npm run build`
installs the server dependencies, and `npm start` starts the server. The
preferred configuration is still Root Directory `server`, where `npm install`
and `npm start` run directly against the backend package.

Do not use `npm run dev` on Render; it starts nodemon and is intended only for
local development. Render provides the `PORT` environment variable, which the
server reads automatically.

Add these backend environment variables:

```dotenv
NODE_ENV=production
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<a-strong-random-secret-at-least-32-characters>
JWT_EXPIRES_IN=8h
COOKIE_NAME=uass_auth
CLIENT_URL=https://<your-frontend-service>.onrender.com
SIMULATOR_INTERVAL_MS=3000
```

After deployment, verify the service at:

```text
https://<your-backend-service>.onrender.com/health
```

It should return `{ "status": "ok" }`.

### 2. Deploy the frontend

Create a **Static Site** from the same repository with these settings:

| Setting | Value |
| --- | --- |
| Root Directory | `client` |
| Environment Variable | `NODE_VERSION=20.19.0` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

Add these frontend environment variables before building:

```dotenv
VITE_API_BASE_URL=https://<your-backend-service>.onrender.com/api/v1
VITE_SOCKET_URL=https://<your-backend-service>.onrender.com
```

Update the backend `CLIENT_URL` with the final frontend URL if Render assigns
a different address. Since the frontend is a single-page application, add a
Render rewrite from `/*` to `/index.html` when configuring client-side route
refreshes.

### 3. Create the first production user

After the backend is deployed and connected to MongoDB, run the seed command
from a local checkout using the production `MONGODB_URI`, or use a protected
Render shell/job:

```bash
cd server
npm install
npm run seed
```

Never place production database credentials or the admin password in the
repository or in the README.

## Application routes

| Route | Purpose | Roles |
| --- | --- | --- |
| `/login` | Sign in or create a viewer account | Public |
| `/dashboard` | Summary and latest telemetry | All authenticated users |
| `/monitoring` | Live observation monitor | All authenticated users |
| `/tracking` | Flight/position tracking | All authenticated users |
| `/observations` | Historical observation records | All authenticated users |
| `/collections` | Start and stop collection sessions | Admin, operator |
| `/users` | Manage users | Admin |
| `/audit-logs` | Review audit activity | Admin |

## REST API

The API base URL is `http://localhost:5000/api/v1`. Authentication uses the
HTTP-only cookie set by `POST /auth/login`.

| Resource | Endpoints |
| --- | --- |
| Health | `GET /health` |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Dashboard | `GET /dashboard/summary`, `GET /dashboard/latest` |
| Users | `GET/POST /users`, `GET/PATCH/DELETE /users/:id` |
| Observations | `GET/POST /observations`, `GET/PATCH/DELETE /observations/:id` |
| Observation tools | `GET /observations/export`, `DELETE /observations/all`, `DELETE /observations/filter`, `POST /observations/:id/restore` |
| Collections | `GET /collections`, `GET /collections/:id`, `POST /collections/start`, `POST /collections/:id/stop` |
| Audit logs | `GET /audit-logs` |

All protected endpoints require authentication. The API validates request
parameters and bodies and returns errors in the following shape:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "details": []
}
```

For request parameters, response examples, pagination, filters, and role
requirements, see [docs/API.md](./docs/API.md).

## Telemetry and data collection

### Simulator

Starting a collection from `/collections` creates one running simulated
session. Only one session can run at a time. The simulator emits an observation
every `SIMULATOR_INTERVAL_MS` milliseconds and cycles through altitudes from
0 to 30,000 meters in 500-meter increments. It approximates temperature,
pressure, humidity, wind speed, wind direction, latitude, and longitude.

Stopping a session marks it `completed`. If the server restarts while a
session is marked `running`, startup recovery marks that orphaned session
`failed`.

### LAN instrument receivers

The server starts listeners for external telemetry at startup:

- UDP port `5001`: accepts JSON telemetry or comma-separated
  `altitude,temperature,pressure,humidity,windSpeed,windDirection`
- TCP port `5002`: accepts JSON telemetry frames

Instrument observations are stored with `source: "instrument"` and are
broadcast to connected clients. Use a device-specific adapter or gateway to
translate a physical sensor protocol into the accepted payload format.

Observation fields and valid ranges are documented in
[docs/DATA_FORMAT.md](./docs/DATA_FORMAT.md).

## Testing

Run frontend tests:

```bash
cd client
npm test
```

Run backend tests:

```bash
cd server
npm test
```

The backend test suite requires `MONGODB_URI_TEST`, which should point to a
separate MongoDB Atlas database so test cleanup cannot affect application data.
The frontend tests run in a jsdom environment with the setup in
`client/src/test/setup.js`.

## Project structure

```text
UASS-Monitoring-System/
├── client/
│   ├── src/
│   │   ├── components/       Reusable charts, layout, and UI components
│   │   ├── context/          Auth, socket, theme, alerts, and data-source state
│   │   ├── hooks/            Dashboard and observation data hooks
│   │   ├── pages/            Application screens
│   │   ├── routes/           Protected route handling
│   │   ├── services/         REST API service modules
│   │   └── test/             Vitest and React Testing Library setup
│   └── package.json
├── server/
│   ├── src/
│   │   ├── collectors/       Simulator and UDP/TCP telemetry receivers
│   │   ├── config/           Environment and database configuration
│   │   ├── controllers/      HTTP request handlers
│   │   ├── middleware/       Authentication, authorization, validation, errors
│   │   ├── models/           Mongoose models
│   │   ├── routes/           REST route definitions
│   │   ├── services/         Domain and persistence operations
│   │   └── sockets/          Authenticated Socket.IO server
│   ├── tests/                Jest and Supertest tests
│   └── package.json
├── docs/                     API, architecture, and data-format references
├── scripts/maintenance/      One-off maintenance scripts
└── migrate.mjs               Source-tree migration utility
```

## Security notes

- JWTs are sent in HTTP-only cookies rather than browser-accessible storage.
- Configure `CLIENT_URL` to the exact trusted frontend origin.
- Use a unique strong `JWT_SECRET` outside development.
- Do not expose MongoDB or the telemetry listeners publicly without network
  controls and an authenticated gateway.
- The LAN receiver should be placed behind a trusted network boundary before
  connecting physical equipment.
- Do not commit `.env` files, passwords, tokens, or production database URLs.

## Related documentation

- [API reference](./docs/API.md)
- [Architecture guide](./docs/ARCHITECTURE.md)
- [Telemetry data format](./docs/DATA_FORMAT.md)
- [Client package](./client/package.json)
- [Server package](./server/package.json)
