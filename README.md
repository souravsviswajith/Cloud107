# Cloud107

Cloud107 lets you run and manage applications, environments, machines, and workloads from one workspace.

It is open source and can be run on infrastructure you control.

## Start here

You can use Cloud107 through:

- Web workspace
- `c107` CLI
- Chrome / Chromium
- Firefox

The workspace includes:

- **Normal** — everyday applications and workloads
- **Developer** — projects, environments, toolchains, and development tools
- **Supercomputer** — high-resource and distributed workloads when those resources are available

Common workspace areas include:

- Projects
- Nodes
- Operations
- Terminal
- Settings

## Quick start with Docker

Requirements:

- Docker
- Docker Compose

Create the environment file:

```bash
cp .env.example .env
```

Set the required values in `.env`, including:

```env
SQL_ADMIN_PASSWORD=change-this
SQL_PASSWORD=change-this
C107_AUTH_SECRET=change-this
```

Start Cloud107:

```bash
docker compose up -d
```

The database migration runs before the Cloud107 application starts.

Open:

```text
http://localhost:3000
```

Stop it with:

```bash
docker compose down
```

The PostgreSQL data is stored in the `cloud107-postgres` volume.

## Run from source

Requirements:

- Node.js 22+
- PostgreSQL 15+
- Git

Install dependencies:

```bash
npm install
```

Configure the environment:

```bash
cp .env.example .env
```

Run database migrations:

```bash
npm run db:migrate
```

Start the development server:

```bash
npm run dev
```

Build and run the production application:

```bash
npm run build
npm start
```

## c107

The CLI provides a terminal interface to Cloud107.

```bash
npm run c107 -- --help
npm run c107 -- --version
```

The update command uses the project's verification and rollback flow:

```bash
npm run c107:update
```

## Updating

Cloud107 includes Universal Update Management.

Updates can be checked and applied through `c107`. The update path includes provenance, signature, hash, compatibility, checkpoint, health, activation, and rollback steps.

For the implementation details, see `docs/updates/`.

## Documentation

The README is intentionally short.

For the project details, see:

```text
docs/
├── architecture/
├── design/
├── development/
├── runtime/
├── deployment/
├── security/
├── updates/
├── APIs/
├── CLI/
├── environments/
├── nodes/
├── workloads/
├── AI/
├── operations/
├── decisions/
└── research/
```

Start with [docs/README.md](docs/README.md).

## Development checks

```bash
npm run test
npm run lint
npm run build
```

## License

Cloud107 is licensed under the GNU Affero General Public License v3.0 or later.

See [LICENSE](LICENSE).

## Repository

Source code and project history:

https://github.com/souravsviswajith/Cloud107
