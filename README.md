# First Containerized FastAPI App (with Postgres + Alembic)

This project is a minimal example of running a **FastAPI** application with a **PostgreSQL** database using **Docker Compose**, with database schema managed by **Alembic** migrations.

The goal is to have the same stack (API + DB + migrations) running consistently on any machine with Docker installed.

---

## Project structure

```text
first-containerized/
├── docker-compose.yml
├── .env
├── .env.example
├── .gitignore
└── fastapi/
    ├── Dockerfile
    ├── entrypoint.sh
    ├── requirements.txt
    ├── alembic.ini
    ├── alembic/
    │   ├── env.py
    │   └── versions/
    │       └── <migration files>.py
    └── app/
        └── main.py
```

- `docker-compose.yml` – defines the `postgres` and `fastapi` services and a named volume for data.
- `.env` – real environment variables (not committed) used by Docker Compose and the app.
- `.env.example` – template env file with the same variable names, without secrets.
- `fastapi/Dockerfile` – builds the FastAPI image, installs dependencies, copies app + Alembic files, and sets the entrypoint.
- `fastapi/entrypoint.sh` – startup script that runs Alembic migrations, then starts Uvicorn.
- `fastapi/alembic.ini` & `fastapi/alembic/` – Alembic configuration, env, and migration versions.
- `fastapi/app/main.py` – FastAPI application code.

---

## Prerequisites

- Docker  
- Docker Compose (comes with recent Docker Desktop / Docker Engine)

---

## Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and set values, for example:

```env
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydb

# Used by your FastAPI settings / Alembic env.py
DATABASE_URL=postgresql://myuser:mypassword@postgres:5432/mydb
```

Notes:

- `POSTGRES_*` are used by the official `postgres:16-alpine` image in `docker-compose.yml` to initialize the database on first run.
- `DATABASE_URL` is used by the FastAPI app and Alembic to connect to Postgres.
- The host in `DATABASE_URL` is `postgres` (the service name), not `localhost`, because FastAPI connects over the internal Docker network created by Docker Compose.

---

## How migrations work

This project uses **Alembic** to manage the database schema:

- `alembic init alembic` has already been run and the resulting `alembic/` and `alembic.ini` are part of the repo.
- `alembic/env.py` is configured to:
  - Make `app/` importable.
  - Import your `Base` and models (e.g. `User`).
  - Read `DATABASE_URL` from your settings and inject it into Alembic’s config.

At container startup, the `fastapi` service:

1. Runs `alembic upgrade head` to apply all pending migrations to the database.
2. Starts FastAPI with Uvicorn.

This ensures that whenever you start the stack, the database schema is automatically migrated to the latest version.

To create a new migration after changing models (run from `/fastapi`):

```bash
alembic revision --autogenerate -m "describe your change"
```

Commit the new file in `alembic/versions/` so it can be applied on other machines.

---

## Running the stack

From the project root:

```bash
docker compose up --build
```

This will:

- Create a Docker network and a `pgdata` volume for Postgres data.
- Start the `postgres` service and wait until it is healthy.
- Build the FastAPI image.
- Start the `fastapi` service, which will:
  - Run `alembic upgrade head` inside the container.
  - Start Uvicorn with your FastAPI app.

Once running:

- API root: <http://localhost:8000>  
- Interactive docs (Swagger UI): <http://localhost:8000/docs>

To stop the services:

```bash
docker compose down
```

The `pgdata` volume is preserved, so database data (and applied migrations) persist between runs. If you want a completely fresh database, you can also remove the volume:

```bash
docker compose down -v
```

---

## Development notes

### Local dev without Docker (optional)

If you want to develop outside Docker:

1. Create a virtualenv.
2. Install dependencies from `fastapi/requirements.txt`:

   ```bash
   cd fastapi
   pip install -r requirements.txt
   ```

3. Make sure `DATABASE_URL` points to a reachable Postgres instance.
4. Run Alembic migrations:

   ```bash
   alembic upgrade head
   ```

5. Start FastAPI:

   ```bash
   uvicorn app.main:app --reload
   ```

### Regenerating migrations

Whenever you change your SQLAlchemy models:

1. Update your models under `app/`.
2. Generate a new migration:

   ```bash
   cd fastapi
   alembic revision --autogenerate -m "what changed"
   ```

3. Review the generated migration in `alembic/versions/`.
4. Commit it to Git.
5. Next time the container starts, `alembic upgrade head` will apply it automatically.
