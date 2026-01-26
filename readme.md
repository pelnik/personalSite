# Personal Site

A personal website built with React frontend and Express backend, featuring multiple API modules including a fitness tracker.

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL client (for seeding): `brew install postgresql` on macOS

## Local Development Setup

### 1. Start the database

```bash
docker compose up db -d
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
# Terminal 1: Start the Express API server
npm run start:dev

# Terminal 2: Start the React dev server
npm run start
```

The React app runs on `http://localhost:3001` and proxies API requests to the Express server on port 3000.

## Running Tests

### Fitness API Tests

```bash
# Make sure the database is running
docker compose up db -d

# Seed the fitness database
npm run seed:fitness

# Run tests
npm run test:fitness
```

Tests use [supertest](https://github.com/ladjs/supertest) to test the Express app directly without needing a running server.

### Frontend Tests

```bash
npm run test:frontend
```

## Docker Commands

```bash
# Start database
docker compose up db -d

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
| `npm run start` | Start React dev server on port 3001 |
| `npm run start:dev` | Start Express server with nodemon |
| `npm run start:prod` | Start Express server in production mode |
| `npm run build` | Build React app for production |
| `npm run seed:all` | Seed all databases |
| `npm run seed:fitness` | Seed fitness database |
| `npm run seed:juicebox` | Seed juicebox database |
| `npm run seed:scents` | Seed scents database |
| `npm run test:fitness` | Run fitness API tests |
| `npm run test:frontend` | Run frontend tests |

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
