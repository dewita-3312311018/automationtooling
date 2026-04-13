# Inventory Backend (inventory-be)

This is the backend API for Automation and Tooling, built with [Hono](https://hono.dev/) and [Drizzle ORM](https://orm.drizzle.team/).

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Hono](https://hono.dev/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: MySQL (via `mysql2`)
- **Validation**: [Zod](https://zod.dev/)
- **Documentation**: [Scalar](https://scalar.com/)

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended) and [NPM](https://www.npmjs.com/).
- Access to a MySQL database.

### 2. Installation

```bash
npm install
```

### 3. Environment Configuration

Copy the `.env.example` file to `.env` and fill in your details:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | The port the server will run on | `3000` |
| `DATABASE_URL` | MySQL connection string | `mysql://root@127.0.0.1:3306/dewi` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `JWT_SECRET` | Secret key for JWT authentication | `supersecret123` |

### 4. Database Setup

Ensure your MySQL database is running, then run the migrations:

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed the database (optional)
npm run seed
```

### 5. Running the Application

```bash
# Development mode with hot-reload
npm run dev

# Production mode
npm run start
```

## 📖 API Documentation

Once the server is running, you can access the interactive API documentation at:

[http://localhost:3000/reference](http://localhost:3000/reference)

The OpenAPI specification is available at `GET /openapi.json`.

## 📂 Project Structure

- `src/index.ts`: Entry point of the application.
- `src/router/`: Route definitions.
- `src/db/`: Database schema and configuration.
- `src/middleware/`: Custom Hono middlewares.
- `docs/`: Documentation and OpenAPI specs.

## 🛠️ Available Scripts

- `npm run dev`: Runs the app in development mode using `tsx watch`.
- `npm run start`: Runs the app in production mode.
- `npm run db:generate`: Generates Drizzle migration files.
- `npm run db:migrate`: Executes Drizzle migrations.
- `npm run db:studio`: Opens Drizzle Studio to manage your database.
- `npm run seed`: Seeds the database with initial data.
