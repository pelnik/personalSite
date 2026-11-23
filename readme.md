# Personal Site

A personal website built with React frontend and Express backend, featuring multiple API modules including a fitness tracker.

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL client (for seeding): `brew install postgresql` on macOS

## Local Development Setup

### 1. Start the database

```bash
docker compose up db -d --no-recreate
```

This starts a PostgreSQL 16 container with three databases: `juicebox`, `fitness`, and `scents`.

### 2. Configure environment

Copy the example env file and update values as needed:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL` - Main juicebox database connection
- `FITNESS_DATABASE_URL` - Fitness tracker database connection
- `SCENTS_DATABASE_URL` - Scents database connection
- `JWT_SECRET` - Secret for JWT token signing

### 3. Install dependencies

```bash
npm install
```

### 4. Seed the databases

```bash
npm run seed:all        # Seed all databases
# Or individually:
npm run seed:juicebox
npm run seed:fitness
npm run seed:scents
```

### 5. Start development servers

```bash
npm run dev
```

This starts both the Express API server (port 3000) and React dev server (port 3001) together.

Open `http://localhost:3001` in your browser.

## Running Tests

```bash
docker compose up db -d --no-recreate
npm test                     # all API tests
npm run test:fitness         # fitness API tests only
npm run test:e2e             # build and run functional and screenshot tests
npm run test:e2e:functional  # functional Playwright tests (build first)
npm run test:db:clean        # remove every checkout's test databases
```

Test databases are created automatically and do not require seeding the development databases. `test:db:clean` can interrupt tests in another checkout. See [AGENTS.md](AGENTS.md#testing) for setup, safety, and screenshot details.

## Docker Commands

```bash
# Start database
docker compose up db -d --no-recreate

# Check running containers
docker compose ps

# View database logs
docker compose logs db

# Stop containers (keeps data)
docker compose down

# Stop containers and delete data
docker compose down -v
```

## NPM Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start both React and Express servers for development |
| `npm run prod` | Build React and start Express in production mode |
| `npm run build` | Build React app for production |
| `npm run seed:all` | Seed all databases |
| `npm run seed:fitness` | Seed fitness database |
| `npm run seed:juicebox` | Seed juicebox database |
| `npm run seed:scents` | Seed scents database |
| `npm run test:fitness` | Run fitness API tests |
| `npm test` | Run API tests |
| `npm run test:e2e` | Build and run Playwright tests |
| `npm run test:db:clean` | Drop all checkout test databases |

## Project Structure

```text
personalSite/
├── src/
│   ├── api/
│   │   ├── fitness-tracker/    # Fitness API module
│   │   │   ├── api/            # Express routes
│   │   │   ├── db/             # Database functions & seed
│   │   │   └── tests/          # API tests (supertest)
│   │   ├── juicebox/           # Juicebox API module
│   │   └── scents/             # Scents API module
│   ├── components/             # React components
│   └── pages/                  # React pages
├── docker/
│   └── init-db.sql             # Database initialization
├── docker-compose.yml          # Local development
├── docker-compose.prod.yml     # Production deployment
├── Dockerfile                  # Multi-stage Docker build
└── server.js                   # Express server entry point
```

## Production Deployment

The application can be deployed using Docker:

```bash
docker compose -f docker-compose.prod.yml up -d
```

SSL certificates should be placed in the `Keys/` directory:

- `key.pem` - Private key
- `pelnik_dev.crt` - Certificate
- `pelnik_dev.ca-bundle` - CA bundle

The HTTPS server only starts in production mode when certificates are present.

## CI/CD

GitHub Actions automatically runs tests on:

- Pull requests to any branch
- Pushes to main

See `.github/workflows/test.yml` for the workflow configuration.
