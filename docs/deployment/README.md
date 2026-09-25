# Deployment

This page documents the deployment path currently present in the repository.

## Docker Compose

The repository includes a Docker Compose setup with three services:

```text
PostgreSQL
    │
    ▼
cloud107-migrate
    │
    ▼
cloud107
```

### PostgreSQL

The `postgres` service provides persistent database storage through the `cloud107-postgres` volume.

The database administrator values are supplied through:

```env
SQL_ADMIN_USER
SQL_ADMIN_PASSWORD
SQL_DB_NAME
```

`SQL_ADMIN_PASSWORD` is required by the Compose configuration.

### Migration service

`cloud107-migrate` uses the same Cloud107 image and runs:

```bash
npm run db:migrate
```

It waits for PostgreSQL to become healthy.

The application service waits for the migration service to complete successfully before starting.

### Application service

The `cloud107` service runs the production image and exposes port `3000`.

Its database and application settings include:

```env
SQL_HOST
SQL_USER
SQL_PASSWORD
SQL_DB_NAME
C107_AUTH_SECRET
GEMINI_API_KEY
APP_URL
```

## Docker image

The Dockerfile uses two stages.

### Build stage

```text
node:22-alpine
    │
    ├── npm ci
    ├── copy source
    └── npm run build
```

### Runtime stage

The runtime image uses `node:22-alpine`, installs production dependencies, copies the built application and database migration/configuration files, and runs as the non-root `node` user.

The application starts with:

```bash
node dist/server.cjs
```

## Local deployment

```bash
cp .env.example .env
docker compose up -d
```

Check the services:

```bash
docker compose ps
docker compose logs -f cloud107
```

Stop the deployment:

```bash
docker compose down
```

The PostgreSQL volume is retained by default when using `docker compose down`.

## Deployment boundary

The current Compose deployment establishes the application and database services. Node coordination, additional deployment targets, and platform-specific packaging should be documented here only when the corresponding implementation is present and verified.

## Validation

Before treating a deployment change as complete, run:

```bash
npm run test
npm run lint
npm run build
```

For container changes, build and start the Compose deployment and verify that PostgreSQL becomes healthy, migrations complete successfully, Cloud107 starts afterward, port `3000` is reachable, and the health endpoint reports the actual service state.

Do not document a deployment target as supported solely because packaging files exist. Verify the target first.
