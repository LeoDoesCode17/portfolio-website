# Portfolio Backend — FastAPI + PostgreSQL + Admin Next.js App

This project runs a **FastAPI** application with a **PostgreSQL** database and an **Admin Next.js** application using **Docker Compose**, with database schema managed by **Alembic** migrations.

The goal is to have the full stack (API + DB + migrations + admin UI) running consistently on any machine with Docker installed, accessible locally and remotely via **Tailscale**.

***

## Project Structure

```text
first-containerized/
├── docker-compose.yml
├── .env
├── .env.example
├── .gitignore
├── fastapi/
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       └── <migration files>.py
│   └── app/
│       ├── main.py
│       ├── core/
│       │   ├── config.py
│       │   └── database.py
│       ├── models/
│       ├── schemas/
│       ├── routers/
│       ├── services/
│       └── dependencies.py
└── admin/
    ├── Dockerfile
    ├── package.json
    ├── next.config.ts
    └── app/
        ├── layout.tsx
        ├── page.tsx
        └── auth-test/
            └── page.tsx
```

- `docker-compose.yml` – defines the `postgres`, `fastapi`, and `admin` services and a named volume for data.
- `.env` – real environment variables (not committed) used by Docker Compose and both apps.
- `.env.example` – template env file with the same variable names, without secrets.
- `fastapi/Dockerfile` – builds the FastAPI image, installs dependencies, copies app + Alembic files, and sets the entrypoint.
- `fastapi/entrypoint.sh` – startup script that runs Alembic migrations, then starts Uvicorn.
- `fastapi/alembic.ini` & `fastapi/alembic/` – Alembic configuration, env, and migration versions.
- `fastapi/app/` – FastAPI application code including routers, models, schemas, services, and core config.
- `admin/Dockerfile` – builds the Next.js admin image for local development with hot reload.
- `admin/app/` – Next.js App Router pages and API routes.
- `admin/next.config.ts` – configures the reverse proxy rewrite from `/api/backend/*` to `http://fastapi:8000/*`.

***

## Prerequisites

- Docker
- Docker Compose (comes with recent Docker Desktop / Docker Engine)

***

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and fill in values:

```env
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydb

# Used by FastAPI and Alembic — must use asyncpg driver for async SQLAlchemy
DATABASE_URL=postgresql+asyncpg://myuser:mypassword@postgres:5432/mydb

# JWT authentication
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Dummy password for seeding
DUMMY_PASSWORD=your_dummy_password

# Allowed origins for FastAPI CORS middleware
# Only needed when clients call FastAPI directly (not via Next.js proxy)
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:3001"]
```

**Notes:**

- `POSTGRES_*` are used by the official `postgres:16-alpine` image to initialize the database on first run.
- `DATABASE_URL` must use `postgresql+asyncpg://` (not `postgresql://`) because FastAPI uses async SQLAlchemy with `asyncpg`.
- The host in `DATABASE_URL` is `postgres` (the Docker service name), not `localhost`.
- `ALLOWED_ORIGINS` applies to **direct browser-to-FastAPI** requests only. All requests from the admin Next.js app go through the Next.js reverse proxy and are not subject to CORS enforcement.

***

## Services Overview

### `postgres`
Runs `postgres:16-alpine`. Persists data in a named Docker volume (`pgdata`). Exposes port `5432` on the internal Docker network only — not exposed to the host.

### `fastapi`
Builds from `fastapi/Dockerfile`. Runs Alembic migrations on startup, then starts Uvicorn. Exposes port `8000` to the host. Communicates with `postgres` over the internal Docker network.

### `admin`
Builds from `admin/Dockerfile`. Runs the Next.js admin application in development mode. Exposes port `3001` to the host. All API calls from the admin UI go through a Next.js reverse proxy rewrite to `http://fastapi:8000`, using container-to-container communication — no CORS issues.

***

## How the Admin App Communicates with FastAPI

The admin Next.js app uses a **reverse proxy rewrite** defined in `admin/next.config.ts`:

```typescript
async rewrites() {
  return [
    {
      source: "/api/backend/:path*",
      destination: "http://fastapi:8000/:path*",
    },
  ];
}
```

This means:

- The browser calls `/api/backend/auth/token` (same origin — no CORS).
- Next.js server forwards the request to `http://fastapi:8000/auth/token` over the Docker network.
- FastAPI never receives a cross-origin browser request, so CORS is bypassed entirely.

The `ALLOWED_ORIGINS` setting on FastAPI only matters for clients that call FastAPI **directly** from a browser (e.g. a future public-facing frontend calling the API without going through the proxy).

***

## How Migrations Work

This project uses **Alembic** to manage the database schema:

- `alembic init alembic` has already been run and the resulting `alembic/` and `alembic.ini` are part of the repo.
- `alembic/env.py` is configured to:
  - Make `app/` importable.
  - Import your `Base` and models.
  - Read `DATABASE_URL` from your settings and inject it into Alembic's config.

At container startup, the `fastapi` service:

1. Runs `alembic upgrade head` to apply all pending migrations to the database.
2. Starts FastAPI with Uvicorn.

This ensures that whenever you start the stack, the database schema is automatically migrated to the latest version.

To create a new migration after changing models (run from `fastapi/`):

```bash
alembic revision --autogenerate -m "describe your change"
```

Commit the new file in `alembic/versions/` so it is applied on other machines.

***

## Running the Stack

From the project root:

```bash
docker compose up --build
```

This will:

- Create a Docker network and a `pgdata` volume for Postgres data.
- Start the `postgres` service and wait until it is healthy.
- Build the FastAPI image and start Uvicorn after running migrations.
- Build the Next.js admin image and start the dev server.

Once running:

| Service | URL |
|---|---|
| FastAPI root | http://localhost:8000 |
| FastAPI Swagger UI | http://localhost:8000/docs |
| Admin Next.js app | http://localhost:3001 |
| Auth test page | http://localhost:3001/auth-test |

To stop the services:

```bash
docker compose down
```

The `pgdata` volume is preserved, so database data and applied migrations persist between runs. To start with a completely fresh database:

```bash
docker compose down -v
```

***

## Accessing the Admin App Remotely via Tailscale

Both your Raspberry Pi 5 and your laptop have Tailscale installed. This allows you to access the admin app from your laptop even when it is not on the same local network as the Raspberry Pi.

From your laptop, open:

```
http://<raspi-tailscale-ip>:3001
```

You can find your Raspberry Pi's Tailscale IP by running on the Pi:

```bash
tailscale ip -4
```

Optionally, enable **Tailscale MagicDNS** to use a hostname instead of an IP:

```
http://raspi.<tailnet-name>.ts.net:3001
```

Port `8000` (FastAPI) does not need to be directly accessible from your laptop — all API communication goes through the admin Next.js app's internal proxy.

***

## Development Notes

### Local Dev Without Docker (Optional)

**FastAPI:**

1. Create a virtualenv and install dependencies:

   ```bash
   cd fastapi
   pip install -r requirements.txt
   ```

2. Ensure `DATABASE_URL` points to a reachable Postgres instance.
3. Run migrations:

   ```bash
   alembic upgrade head
   ```

4. Start FastAPI:

   ```bash
   uvicorn app.main:app --reload
   ```

**Admin Next.js:**

1. Install dependencies:

   ```bash
   cd admin
   npm install
   ```

2. Update `next.config.ts` to point to `http://localhost:8000` instead of `http://fastapi:8000` (the Docker service name is not resolvable outside Docker):

   ```typescript
   destination: "http://localhost:8000/:path*"
   ```

3. Start the dev server:

   ```bash
   npm run dev -- -p 3001
   ```

### Regenerating Migrations

Whenever you change your SQLAlchemy models:

1. Update your models under `fastapi/app/models/`.
2. Generate a new migration:

   ```bash
   cd fastapi
   alembic revision --autogenerate -m "what changed"
   ```

3. Review the generated migration in `alembic/versions/`.
4. Commit it to Git.
5. Next time the container starts, `alembic upgrade head` applies it automatically.

### Rebuilding a Single Service

To rebuild only one service without restarting the entire stack:

```bash
docker compose up --build fastapi
docker compose up --build admin
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Single service
docker compose logs -f fastapi
docker compose logs -f admin
```# Portfolio Backend — FastAPI + PostgreSQL + Admin Next.js App

This project runs a **FastAPI** application with a **PostgreSQL** database and an **Admin Next.js** application using **Docker Compose**, with database schema managed by **Alembic** migrations.

The goal is to have the full stack (API + DB + migrations + admin UI) running consistently on any machine with Docker installed, accessible locally and remotely via **Tailscale**.

***

## Project Structure

```text
first-containerized/
├── docker-compose.yml
├── .env
├── .env.example
├── .gitignore
├── fastapi/
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       └── <migration files>.py
│   └── app/
│       ├── main.py
│       ├── core/
│       │   ├── config.py
│       │   └── database.py
│       ├── models/
│       ├── schemas/
│       ├── routers/
│       ├── services/
│       └── dependencies.py
└── admin/
    ├── Dockerfile
    ├── package.json
    ├── next.config.ts
    └── app/
        ├── layout.tsx
        ├── page.tsx
        └── auth-test/
            └── page.tsx
```

- `docker-compose.yml` – defines the `postgres`, `fastapi`, and `admin` services and a named volume for data.
- `.env` – real environment variables (not committed) used by Docker Compose and both apps.
- `.env.example` – template env file with the same variable names, without secrets.
- `fastapi/Dockerfile` – builds the FastAPI image, installs dependencies, copies app + Alembic files, and sets the entrypoint.
- `fastapi/entrypoint.sh` – startup script that runs Alembic migrations, then starts Uvicorn.
- `fastapi/alembic.ini` & `fastapi/alembic/` – Alembic configuration, env, and migration versions.
- `fastapi/app/` – FastAPI application code including routers, models, schemas, services, and core config.
- `admin/Dockerfile` – builds the Next.js admin image for local development with hot reload.
- `admin/app/` – Next.js App Router pages and API routes.
- `admin/next.config.ts` – configures the reverse proxy rewrite from `/api/backend/*` to `http://fastapi:8000/*`.

***

## Prerequisites

- Docker
- Docker Compose (comes with recent Docker Desktop / Docker Engine)

***

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and fill in values:

```env
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydb

# Used by FastAPI and Alembic — must use asyncpg driver for async SQLAlchemy
DATABASE_URL=postgresql+asyncpg://myuser:mypassword@postgres:5432/mydb

# JWT authentication
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Dummy password for seeding
DUMMY_PASSWORD=your_dummy_password

# Allowed origins for FastAPI CORS middleware
# Only needed when clients call FastAPI directly (not via Next.js proxy)
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:3001"]
```

**Notes:**

- `POSTGRES_*` are used by the official `postgres:16-alpine` image to initialize the database on first run.
- `DATABASE_URL` must use `postgresql+asyncpg://` (not `postgresql://`) because FastAPI uses async SQLAlchemy with `asyncpg`.
- The host in `DATABASE_URL` is `postgres` (the Docker service name), not `localhost`.
- `ALLOWED_ORIGINS` applies to **direct browser-to-FastAPI** requests only. All requests from the admin Next.js app go through the Next.js reverse proxy and are not subject to CORS enforcement.

***

## Services Overview

### `postgres`
Runs `postgres:16-alpine`. Persists data in a named Docker volume (`pgdata`). Exposes port `5432` on the internal Docker network only — not exposed to the host.

### `fastapi`
Builds from `fastapi/Dockerfile`. Runs Alembic migrations on startup, then starts Uvicorn. Exposes port `8000` to the host. Communicates with `postgres` over the internal Docker network.

### `admin`
Builds from `admin/Dockerfile`. Runs the Next.js admin application in development mode. Exposes port `3001` to the host. All API calls from the admin UI go through a Next.js reverse proxy rewrite to `http://fastapi:8000`, using container-to-container communication — no CORS issues.

***

## How the Admin App Communicates with FastAPI

The admin Next.js app uses a **reverse proxy rewrite** defined in `admin/next.config.ts`:

```typescript
async rewrites() {
  return [
    {
      source: "/api/backend/:path*",
      destination: "http://fastapi:8000/:path*",
    },
  ];
}
```

This means:

- The browser calls `/api/backend/auth/token` (same origin — no CORS).
- Next.js server forwards the request to `http://fastapi:8000/auth/token` over the Docker network.
- FastAPI never receives a cross-origin browser request, so CORS is bypassed entirely.

The `ALLOWED_ORIGINS` setting on FastAPI only matters for clients that call FastAPI **directly** from a browser (e.g. a future public-facing frontend calling the API without going through the proxy).

***

## How Migrations Work

This project uses **Alembic** to manage the database schema:

- `alembic init alembic` has already been run and the resulting `alembic/` and `alembic.ini` are part of the repo.
- `alembic/env.py` is configured to:
  - Make `app/` importable.
  - Import your `Base` and models.
  - Read `DATABASE_URL` from your settings and inject it into Alembic's config.

At container startup, the `fastapi` service:

1. Runs `alembic upgrade head` to apply all pending migrations to the database.
2. Starts FastAPI with Uvicorn.

This ensures that whenever you start the stack, the database schema is automatically migrated to the latest version.

To create a new migration after changing models (run from `fastapi/`):

```bash
alembic revision --autogenerate -m "describe your change"
```

Commit the new file in `alembic/versions/` so it is applied on other machines.

***

## Running the Stack

From the project root:

```bash
docker compose up --build
```

This will:

- Create a Docker network and a `pgdata` volume for Postgres data.
- Start the `postgres` service and wait until it is healthy.
- Build the FastAPI image and start Uvicorn after running migrations.
- Build the Next.js admin image and start the dev server.

Once running:

| Service | URL |
|---|---|
| FastAPI root | http://localhost:8000 |
| FastAPI Swagger UI | http://localhost:8000/docs |
| Admin Next.js app | http://localhost:3001 |
| Auth test page | http://localhost:3001/auth-test |

To stop the services:

```bash
docker compose down
```

The `pgdata` volume is preserved, so database data and applied migrations persist between runs. To start with a completely fresh database:

```bash
docker compose down -v
```

***

## Accessing the Admin App Remotely via Tailscale

Both your Raspberry Pi 5 and your laptop have Tailscale installed. This allows you to access the admin app from your laptop even when it is not on the same local network as the Raspberry Pi.

From your laptop, open:

```
http://<raspi-tailscale-ip>:3001
```

You can find your Raspberry Pi's Tailscale IP by running on the Pi:

```bash
tailscale ip -4
```

Optionally, enable **Tailscale MagicDNS** to use a hostname instead of an IP:

```
http://raspi.<tailnet-name>.ts.net:3001
```

Port `8000` (FastAPI) does not need to be directly accessible from your laptop — all API communication goes through the admin Next.js app's internal proxy.

***

## Development Notes

### Local Dev Without Docker (Optional)

**FastAPI:**

1. Create a virtualenv and install dependencies:

   ```bash
   cd fastapi
   pip install -r requirements.txt
   ```

2. Ensure `DATABASE_URL` points to a reachable Postgres instance.
3. Run migrations:

   ```bash
   alembic upgrade head
   ```

4. Start FastAPI:

   ```bash
   uvicorn app.main:app --reload
   ```

**Admin Next.js:**

1. Install dependencies:

   ```bash
   cd admin
   npm install
   ```

2. Update `next.config.ts` to point to `http://localhost:8000` instead of `http://fastapi:8000` (the Docker service name is not resolvable outside Docker):

   ```typescript
   destination: "http://localhost:8000/:path*"
   ```

3. Start the dev server:

   ```bash
   npm run dev -- -p 3001
   ```

### Regenerating Migrations

Whenever you change your SQLAlchemy models:

1. Update your models under `fastapi/app/models/`.
2. Generate a new migration:

   ```bash
   cd fastapi
   alembic revision --autogenerate -m "what changed"
   ```

3. Review the generated migration in `alembic/versions/`.
4. Commit it to Git.
5. Next time the container starts, `alembic upgrade head` applies it automatically.

### Rebuilding a Single Service

To rebuild only one service without restarting the entire stack:

```bash
docker compose up --build fastapi
docker compose up --build admin
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Single service
docker compose logs -f fastapi
docker compose logs -f admin
```