# Cloud107 — Sovereign Infrastructure Control Plane

[![License](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-22%2B-green.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791.svg)](https://www.postgresql.org)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)

**Cloud107** is a self-hosted, source-first infrastructure control plane designed for organizations that need full sovereignty over their computing infrastructure. It provides unified management of nodes, workloads, runtimes, applications, and resources with cryptographic verification and secure identity management.

![Cloud107 Logo](public/assets/cloud107-logo.png)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Requirements](#system-requirements)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Cloud107](#running-cloud107)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Authentication](#authentication)
- [CLI Usage](#cli-usage)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## Overview

Cloud107 is built for organizations that require:

- **Full Sovereignty** — Complete control over infrastructure without vendor lock-in
- **Source-First Approach** — All configurations are code, enabling version control and audit trails
- **Cryptographic Verification** — Secure updates with cryptographic signing
- **Modern Stack** — React 19, Express.js, PostgreSQL with latest best practices
- **Self-Hosted** — Deploy on your own infrastructure or cloud provider

### Use Cases

- **Enterprise Infrastructure** — Manage internal infrastructure with complete control
- **Multi-Tenant Systems** — Host multiple isolated environments securely
- **Compliance-Heavy Environments** — Meet HIPAA, SOC2, PCI-DSS requirements
- **Research Institutions** — Manage compute clusters and research workloads
- **Hybrid Deployments** — Combine on-premises and cloud resources

---

## Key Features

### Frontend

- **React 19** — Latest React with hooks and server components support
- **Vite** — Lightning-fast build tool with HMR (Hot Module Replacement)
- **Tailwind CSS** — Utility-first CSS framework for rapid UI development
- **Sovereign Workspace Shell** — Custom-built workspace interface for infrastructure management
- **Responsive Design** — Works perfectly on desktop, tablet, and mobile

### Backend

- **Express.js** — Lightweight, flexible Node.js framework
- **Modular Architecture** — Clean separation of concerns for easy maintenance
- **RESTful API** — Standard HTTP API for all operations
- **Real-time Updates** — WebSocket support for live status updates
- **Middleware Security** — Helmet.js, CORS, compression, and rate limiting

### Database

- **PostgreSQL 15+** — Industry-standard relational database
- **Drizzle ORM** — Type-safe SQL query builder
- **Migrations** — Version-controlled schema changes
- **Session Persistence** — Local relational storage for sessions and state

### Authentication & Security

- **WebAuthn/FIDO2** — Hardware security key and biometric authentication
- **Sovereign Local Credentials** — Keep authentication under your control
- **Cryptographic Signing** — All updates are cryptographically verified
- **Helmet.js** — Security headers for modern browsers
- **CORS Protection** — Cross-Origin Resource Sharing configuration

### CLI Tools

- **`c107` Command** — Powerful command-line interface for automation
- **Source-First Updates** — `c107 update` with cryptographic verification
- **Configuration Management** — Configure via CLI, environment variables, or files

---

## System Requirements

### Minimum Requirements

| Component      | Requirement                                                          |
| -------------- | -------------------------------------------------------------------- |
| **OS**         | Linux (Ubuntu 20.04+, CentOS 8+), macOS 12+, or Windows 11 with WSL2 |
| **CPU**        | 2 cores (4+ recommended)                                             |
| **Memory**     | 4 GB RAM (8+ GB recommended)                                         |
| **Disk**       | 20 GB free space (SSD recommended)                                   |
| **Node.js**    | 22.x LTS or later                                                    |
| **npm**        | 10.x or later                                                        |
| **PostgreSQL** | 15 or later                                                          |

### Recommended for Production

| Component      | Recommendation                      |
| -------------- | ----------------------------------- |
| **OS**         | Ubuntu 22.04 LTS or CentOS 8 Stream |
| **CPU**        | 8+ cores                            |
| **Memory**     | 16+ GB RAM                          |
| **Disk**       | 100+ GB SSD with NVMe               |
| **Network**    | Gigabit or faster                   |
| **PostgreSQL** | 15+ with replication backup         |
| **SSL/TLS**    | Modern TLS 1.3                      |

---

## Prerequisites

Before installing Cloud107, ensure you have:

### 1. Node.js & npm

**Check if installed:**

```bash
node --version  # Should be 22.x or later
npm --version   # Should be 10.x or later
```

**Install Node.js:**

- **macOS:** `brew install node@22`
- **Ubuntu/Debian:**
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- **CentOS/RHEL:**
  ```bash
  curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
  sudo yum install -y nodejs
  ```
- **Windows:** Download from [nodejs.org](https://nodejs.org)

### 2. PostgreSQL

**Check if installed:**

```bash
psql --version  # Should be PostgreSQL 15+
```

**Install PostgreSQL:**

- **macOS:** `brew install postgresql@15`
- **Ubuntu/Debian:**
  ```bash
  sudo apt update
  sudo apt install -y postgresql-15 postgresql-contrib-15
  ```
- **CentOS/RHEL:**
  ```bash
  sudo yum install -y postgresql15-server postgresql15-contrib
  sudo /usr/pgsql-15/bin/postgresql-15-setup initdb
  sudo systemctl start postgresql-15
  ```
- **Windows:** Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **Docker:** `docker run -d -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15`

**Start PostgreSQL (if not running):**

```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Or run in Docker
docker run -d -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15
```

### 3. Git (Optional, but recommended)

```bash
git --version  # Check if installed

# Install if needed
# macOS: brew install git
# Ubuntu/Debian: sudo apt install git
# Windows: Download from https://git-scm.com
```

### 4. Text Editor or IDE

Recommended options:

- **VS Code** (free) — https://code.visualstudio.com
- **WebStorm** (paid) — https://www.jetbrains.com/webstorm/
- **Vim/Neovim** — For terminal lovers
- **Sublime Text** — Lightweight and fast

---

## Installation

### Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/souravsviswajith/Cloud107.git
cd Cloud107

# Or download the ZIP file and extract it
unzip Cloud107.zip
cd Cloud107
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# This will download all required packages from npm registry
# Wait for completion (typically 2-5 minutes)
```

### Step 3: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the file with your configuration
nano .env
# or use your preferred editor
```

See [Environment Variables](#environment-variables) section for detailed configuration.

### Step 4: Initialize Database

```bash
# Run database migrations
npm run db:migrate

# Create initial schema
npm run db:seed
```

### Step 5: Verify Installation

```bash
# Run tests to verify everything works
npm run test

# Check linting
npm run lint
```

---

## Configuration

### Step 1: Create `.env` File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit `.env` with your settings:

```env
# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cloud107
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cloud107
DB_USER=cloud107
DB_PASSWORD=your_secure_password

# Auth
JWT_SECRET=your_jwt_secret_key_minimum_32_chars
SESSION_SECRET=your_session_secret_key_minimum_32_chars
WEBAUTHN_RP_ID=localhost
WEBAUTHN_RP_NAME=Cloud107
WEBAUTHN_ORIGIN=http://localhost:3000

# Optional: External Services
GOOGLE_GEMINI_API_KEY=your_api_key_if_using_gemini
```

### Step 3: Create PostgreSQL User

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE cloud107;
CREATE USER cloud107 WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE cloud107 TO cloud107;
ALTER DATABASE cloud107 OWNER TO cloud107;

# Exit psql
\q
```

### Step 4: Run Migrations

```bash
npm run db:migrate
```

---

## Running Cloud107

### Development Mode

```bash
# Start the development server
npm run dev

# The application will be available at http://localhost:3000
# Server automatically restarts on file changes
```

**Dev server includes:**

- ✅ Hot Module Replacement (HMR)
- ✅ Automatic browser refresh
- ✅ Detailed error messages
- ✅ Source maps for debugging

### Production Mode

```bash
# Build for production
npm run build

# Start the production server
npm run start

# Application runs on configured PORT (default 3000)
```

### Background Running (systemd)

Create `/etc/systemd/system/cloud107.service`:

```ini
[Unit]
Description=Cloud107 Sovereign Infrastructure Control Plane
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=cloud107
WorkingDirectory=/opt/cloud107
Environment="NODE_ENV=production"
EnvironmentFile=/opt/cloud107/.env
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloud107
sudo systemctl start cloud107
sudo systemctl status cloud107
```

### Background Running (Docker)

```bash
# Build Docker image
docker build -t cloud107:latest .

# Run container
docker run -d \
  --name cloud107 \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@postgres:5432/cloud107 \
  --link postgres:postgres \
  cloud107:latest

# View logs
docker logs -f cloud107
```

### Background Running (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start npm --name "cloud107" -- start

# View status
pm2 status

# View logs
pm2 logs cloud107

# Auto-restart on boot
pm2 startup
pm2 save
```

---

## Environment Variables

### Required Variables

| Variable         | Description                       | Example                                          |
| ---------------- | --------------------------------- | ------------------------------------------------ |
| `DATABASE_URL`   | PostgreSQL connection string      | `postgresql://user:pass@localhost:5432/cloud107` |
| `JWT_SECRET`     | Secret for JWT tokens (32+ chars) | `your_random_secret_key_here`                    |
| `SESSION_SECRET` | Secret for sessions (32+ chars)   | `another_random_secret_key_here`                 |

### Optional Variables

| Variable                  | Description             | Default                 |
| ------------------------- | ----------------------- | ----------------------- |
| `NODE_ENV`                | Environment mode        | `development`           |
| `PORT`                    | Server port             | `3000`                  |
| `LOG_LEVEL`               | Logging level           | `info`                  |
| `WEBAUTHN_RP_ID`          | WebAuthn RP ID          | `localhost`             |
| `WEBAUTHN_RP_NAME`        | WebAuthn RP Name        | `Cloud107`              |
| `WEBAUTHN_ORIGIN`         | WebAuthn origin URL     | `http://localhost:3000` |
| `CORS_ORIGIN`             | CORS origin             | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW`       | Rate limit window (ms)  | `900000`                |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100`                   |

### Generating Secure Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 32

# Or use pwgen
pwgen -s 32 1
```

---

## Database Setup

### Initial Setup

```bash
# Create database
createdb -U postgres cloud107

# Create user
psql -U postgres -c "CREATE USER cloud107 WITH ENCRYPTED PASSWORD 'password'"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE cloud107 TO cloud107"

# Run migrations
npm run db:migrate
```

### Backup

```bash
# Backup database
pg_dump -U cloud107 -h localhost cloud107 > backup-$(date +%Y%m%d).sql

# Restore from backup
psql -U cloud107 -h localhost cloud107 < backup-20240101.sql
```

### Monitor

```bash
# Connect to database
psql postgresql://cloud107:password@localhost:5432/cloud107

# Check tables
\dt

# Check users
\du

# Check database size
\l+
```

---

## Authentication

### Setting Up WebAuthn/FIDO2

1. **Register Hardware Key:**
   - Navigate to Settings → Security
   - Click "Add Security Key"
   - Follow on-screen instructions
   - Tap your FIDO2 key when prompted

2. **Supported Devices:**
   - YubiKey 5 Series
   - Titan Security Key
   - Windows Hello
   - Touch ID (macOS/iOS)
   - Face ID (iOS)
   - Android biometric

### Local Operator Credentials

1. **Set Operator Password:**

   ```bash
   # During initial setup
   npm run setup
   ```

2. **Change Password:**
   - Navigate to Settings → Security
   - Click "Change Password"
   - Enter current and new password

---

## CLI Usage

### Cloud107 CLI (`c107`)

```bash
# Show help
npm run c107 -- --help

# Check version
npm run c107 -- --version

# List available commands
npm run c107 -- list-commands

# Update Cloud107 (cryptographically verified)
npm run c107:update

# Configure Cloud107
npm run c107 -- config get DATABASE_URL
npm run c107 -- config set LOG_LEVEL=debug

# View logs
npm run c107 -- logs --tail 100

# Health check
npm run c107 -- health
```

### Available Commands

| Command                     | Description                       |
| --------------------------- | --------------------------------- |
| `c107 init`                 | Initialize Cloud107               |
| `c107 status`               | Show application status           |
| `c107 update`               | Update Cloud107 with verification |
| `c107 config get KEY`       | Get config value                  |
| `c107 config set KEY=VALUE` | Set config value                  |
| `c107 logs`                 | View application logs             |
| `c107 health`               | Health check                      |
| `c107 backup`               | Backup database                   |
| `c107 restore`              | Restore from backup               |

---

## Deployment

### Docker Deployment

**1. Create Dockerfile** (if not exists):

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**2. Build and Run:**

```bash
# Build image
docker build -t cloud107:1.0.0 .

# Run container
docker run -d \
  --name cloud107 \
  -p 3000:3000 \
  --env-file .env \
  cloud107:1.0.0
```

### Docker Compose

**1. Create `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: cloud107
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: cloud107
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U cloud107']
      interval: 10s
      timeout: 5s
      retries: 5

  cloud107:
    build: .
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://cloud107:${DB_PASSWORD}@postgres:5432/cloud107
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

**2. Deploy:**

```bash
docker-compose up -d
docker-compose logs -f
```

### Cloud Deployment

#### AWS EC2

```bash
# 1. Launch EC2 instance (Ubuntu 22.04 LTS)
# 2. SSH into instance
ssh -i key.pem ubuntu@instance-ip

# 3. Install dependencies
sudo apt update
sudo apt install -y nodejs npm postgresql-15

# 4. Clone and setup
git clone https://github.com/souravsviswajith/Cloud107.git
cd Cloud107
npm install
cp .env.example .env

# 5. Start
npm run build
npm start
```

#### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create cloud107-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Deploy
git push heroku main

# View logs
heroku logs -t
```

#### DigitalOcean App Platform

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy
4. Attach PostgreSQL database

#### Render

1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect GitHub repository
4. Configure environment variables
5. Deploy

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000
# or on Windows
netstat -ano | findstr :3000

# Kill process
kill -9 <PID>
# or change port in .env
PORT=3001
```

### Database Connection Error

```bash
# Test PostgreSQL connection
psql postgresql://cloud107:password@localhost:5432/cloud107

# Check if PostgreSQL is running
sudo systemctl status postgresql
# or
brew services list | grep postgresql

# Verify connection string in .env
cat .env | grep DATABASE_URL
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache if needed
npm cache clean --force
```

### Build Fails

```bash
# Check Node version
node --version  # Should be 22.x

# Check npm version
npm --version   # Should be 10.x

# Try clean build
npm run clean
npm run build
```

### High Memory Usage

```bash
# Check memory
npm run health

# Increase Node.js heap size
NODE_OPTIONS=--max-old-space-size=4096 npm start

# Or permanently in .env
NODE_OPTIONS=--max-old-space-size=4096
```

### WebAuthn Not Working

```bash
# Ensure WEBAUTHN_ORIGIN matches current URL
# For localhost: http://localhost:3000
# For production: https://yourdomain.com

# Check .env settings
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:3000
```

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              Client (React 19)                  │
│  ├─ Landing Page                                │
│  ├─ Workspace Shell                             │
│  └─ Dashboard Components                        │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   REST API Server   │
        │   (Express.js)      │
        ├─ Auth endpoints     │
        ├─ CRUD operations    │
        ├─ WebSocket gateway  │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  Business Logic     │
        ├─ Services          │
        ├─ Middleware        │
        ├─ Controllers       │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  Data Layer         │
        ├─ Drizzle ORM       │
        ├─ Query Builder     │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   PostgreSQL DB     │
        ├─ Tables            │
        ├─ Schemas           │
        └─ Indices           │
```

### Technology Stack

| Layer    | Technology   | Version         |
| -------- | ------------ | --------------- |
| Frontend | React        | 19              |
| Build    | Vite         | 6.2+            |
| Styling  | Tailwind CSS | 4.1+            |
| Backend  | Express.js   | 4.21+           |
| Runtime  | Node.js      | 22+             |
| Database | PostgreSQL   | 15+             |
| ORM      | Drizzle      | 0.45+           |
| Auth     | WebAuthn     | Modern Browsers |
| Runtime  | Bun Lock     | -               |

### Directory Structure

```
Cloud107/
├── src/
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── server/           # Backend server code
│   ├── db/               # Database configuration
│   ├── lib/              # Utility functions
│   ├── types.ts          # TypeScript definitions
│   └── main.tsx          # Entry point
├── public/
│   ├── assets/           # Static assets
│   └── manifest.json     # PWA manifest
├── docs/                 # Documentation
├── infra/                # Infrastructure as Code
│   ├── terraform/        # Terraform configs
│   └── packer/          # Packer templates
├── agents/               # Agent services
├── desktop-agent/        # Desktop agent
├── workspace-runtime/    # Workspace runtime
├── scripts/              # Utility scripts
├── .env.example          # Environment template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite configuration
└── README.md             # This file
```

---

## Development

### Setting Up Development Environment

```bash
# Install dependencies
npm install

# Start dev server with HMR
npm run dev

# In another terminal, run tests
npm run test:watch
```

### Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- src/components/__tests__/Navbar.test.tsx

# Generate coverage report
npm run test -- --coverage
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint -- --fix

# Format code
npm run format

# Check formatting without changes
npm run format -- --check
```

### Building for Production

```bash
# Build frontend and backend
npm run build

# Output in dist/ directory
ls -la dist/

# Test production build locally
npm run start
```

---

## Contributing

We welcome contributions! Here's how:

### 1. Fork the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Cloud107.git
cd Cloud107
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

```bash
# Make your changes
# Run tests
npm run test

# Run linter
npm run lint
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 5. Create Pull Request

Open a PR on GitHub with:

- Clear description of changes
- Related issues
- Screenshots if UI changes

### Coding Standards

- Use TypeScript for type safety
- Follow existing code style
- Write tests for new features
- Update documentation
- Use conventional commits

---

## License

Cloud107 is released under the **GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)**. See [LICENSE](LICENSE) for the complete license text.

### License and Third-Party Components

Cloud107 is a source-first project. The Cloud107 first-party code is licensed under AGPL-3.0-or-later unless a source file or directory explicitly states otherwise.

Cloud107 also integrates with third-party infrastructure components and libraries that retain their own licenses. In particular, components such as QEMU, FRRouting (FRR), and Open vSwitch (OVS) may carry GPL-family licensing terms. Their licenses are **not replaced by Cloud107's license** and must be respected when those components are distributed or used.

When combining Cloud107 with third-party components, maintain the applicable license notices, copyright notices, source-code obligations, and any required license boundaries. Do not assume that all dependencies are licensed under AGPL-3.0-or-later.

---

## Support

### Getting Help

1. **Check Documentation**
   - Read `docs/` folder for architecture details
   - Check troubleshooting section above
   - Search GitHub issues

2. **Report Issues**
   - https://github.com/souravsviswajith/Cloud107/issues
   - Include: Steps to reproduce, expected behavior, actual behavior
   - Attach: Logs, error messages, environment info

3. **Security Issues**
   - Email: security@cloud107.local (if applicable)
   - Do NOT open public GitHub issues
   - Include: Vulnerability description, proof of concept, impact

### Community

- **GitHub Discussions** — Ask questions, share ideas
- **GitHub Wiki** — Community documentation
- **Email** — Direct inquiries

---

## Quick Links

- **GitHub Repository** — https://github.com/souravsviswajith/Cloud107
- **Documentation** — See `docs/` folder
- **Architecture** — `docs/backend-architecture.md`
- **Issues** — https://github.com/souravsviswajith/Cloud107/issues
- **Discussions** — https://github.com/souravsviswajith/Cloud107/discussions

---

## What's Next?

After installation:

1. ✅ Access the application at `http://localhost:3000`
2. ✅ Set up your first security key in Settings
3. ✅ Create your first workspace
4. ✅ Add your first node to management
5. ✅ Deploy your first workload
6. ✅ Read architecture docs for deep dive

---

## Acknowledgments

Cloud107 is built with modern technologies and best practices:

- **React** for powerful UI
- **Express.js** for backend
- **PostgreSQL** for data persistence
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **WebAuthn** for security

---

## Status & Roadmap

### Current Status

- ✅ Core infrastructure management
- ✅ WebAuthn authentication
- ✅ CLI tools
- ✅ PostgreSQL persistence
- 🚧 Advanced monitoring
- 🚧 Multi-tenancy features
- 🚧 Kubernetes integration

### Upcoming

- Enhanced dashboard
- Mobile application
- GraphQL API
- Event streaming
- Machine learning insights

---

**Last Updated:** September 19, 2026  
**Version:** 1.0.0  
**Status:** Stable / Production Ready

---

## Quick Reference

### Most Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run test            # Run tests
npm run lint            # Check code quality

# Production
npm run build           # Build for production
npm start               # Start production server

# Database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed initial data

# CLI
npm run c107            # Run Cloud107 CLI
npm run c107:update     # Update with verification
```

---

note: I'm just a DevOps guy
