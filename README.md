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

### 1. Prepare Docker

```text
Docker
  │
  ├── Docker Engine
  └── Docker Compose
          │
          ▼
      Cloud107
```

**Requirements**

- Docker
- Docker Compose

Install Docker and Docker Compose using the instructions for your operating system.

**Note:** Docker runs Cloud107 and its PostgreSQL dependency as containers.

### 2. Configure Cloud107

```text
.env.example
      │
      ▼
     .env
      │
      ▼
Cloud107 configuration
```

**Command**

```bash
cp .env.example .env
```

Set the required values in `.env`:

```env
SQL_ADMIN_PASSWORD=change-this
SQL_PASSWORD=change-this
C107_AUTH_SECRET=change-this
```

**Note:** Create the local configuration file and replace the example secrets with your own values.

### 3. Start Cloud107

```text
docker compose up
      │
      ├── PostgreSQL
      │       │
      │       ▼
      │   migration
      │       │
      │       ▼
      └── Cloud107
```

**Command**

```bash
docker compose up -d
```

The database migration runs before the Cloud107 application starts.

**Note:** Start the database, apply its schema, and then start Cloud107.

### 4. Open the workspace

```text
Cloud107 server
      │
      ▼
localhost:3000
      │
      ▼
Web browser
```

**Open**

```text
http://localhost:3000
```

**Note:** Open the local Cloud107 workspace in your browser.

### 5. Stop Cloud107

```text
Cloud107
   │
   ▼
docker compose down
   │
   ▼
Containers stopped
```

**Command**

```bash
docker compose down
```

The PostgreSQL data remains in the `cloud107-postgres` volume.

**Note:** Stop the containers without deleting the stored database volume.

## Run from source

### 1. Install prerequisites

```text
Git + Node.js 22+ + PostgreSQL 15+
                │
                ▼
          Cloud107 source
```

**Requirements**

- Node.js 22+
- PostgreSQL 15+
- Git

**Note:** These tools provide the source-control, JavaScript runtime, and database environment required by the source installation.

### 2. Get the source and install dependencies

```text
Git repository
      │
      ▼
   npm ci
      │
      ▼
Project dependencies
```

**Commands**

```bash
git clone https://github.com/souravsviswajith/Cloud107.git
cd Cloud107
npm ci
```

**Note:** Download the repository and install the dependency versions recorded by the project lockfile.

### 3. Configure the environment

```text
.env.example
      │
      ▼
     .env
      │
      ▼
Application configuration
```

**Command**

```bash
cp .env.example .env
```

Set the required environment values before starting the application.

**Note:** Give Cloud107 the local configuration it needs to connect to its services.

### 4. Run database migrations

```text
PostgreSQL
    │
    ▼
db:migrate
    │
    ▼
Cloud107 database schema
```

**Command**

```bash
npm run db:migrate
```

**Note:** Create or update the database structure required by the current source version.

### 5. Start development mode

```text
Cloud107 source
      │
      ▼
 npm run dev
      │
      ├── API
      └── Web workspace
```

**Command**

```bash
npm run dev
```

**Note:** Start Cloud107 in development mode.

### 6. Build and run production mode

```text
Source
  │
  ▼
npm run build
  │
  ▼
dist/
  │
  ▼
npm start
```

**Commands**

```bash
npm run build
npm start
```

**Note:** Build the production application and then start the generated server.

## c107

The CLI provides a terminal interface to Cloud107.

### Check the CLI

```text
c107
 │
 ├── --help
 └── --version
```

**Commands**

```bash
npm run c107 -- --help
npm run c107 -- --version
```

**Note:** Use these commands to see available CLI operations and the installed CLI version.

### Update Cloud107

```text
c107
 │
 ▼
Update pipeline
 │
 ├── provenance
 ├── signature
 ├── hash
 ├── compatibility
 ├── checkpoint
 ├── health
 ├── activation
 └── rollback
```

**Command**

```bash
npm run c107:update
```

**Note:** Run the Cloud107 update workflow. The update system verifies the update before activation and can roll back after a checkpoint if validation fails.

For implementation details, see `docs/updates/`.

## Development checks

```text
Source
  │
  ├── test
  ├── lint
  └── build
```

**Commands**

```bash
npm run test
npm run lint
npm run build
```

**Note:** Run the automated tests, code checks, and production build.

## Documentation

The repository documentation contains architecture, development, deployment, runtime, security, operations, decisions, and research material.

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

Guidance in the documentation should use:

```text
Diagram
   ↓
Actual command / configuration
   ↓
Brief common-language explanation
   ↓
Expected result or next step
```

## License

Cloud107 is licensed under the GNU Affero General Public License v3.0 or later.

See [LICENSE](LICENSE).

## Repository

Source code and project history:

https://github.com/souravsviswajith/Cloud107
