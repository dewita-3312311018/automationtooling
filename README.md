# Project Dewi

Welcome to **Project Dewi**, a full-stack inventory management system. This project is structured as a monorepo containing a Hono-based backend and a TanStack Router React frontend.

## 🏗️ Project Structure

- [inventory-be](./inventory-be): The backend API built with [Hono](https://hono.dev/), [Drizzle ORM](https://orm.drizzle.team/), and [Node.js](https://nodejs.org/).
- [inventory-fe](./inventory-fe): The frontend application built with [TanStack Router](https://tanstack.com/router/latest), [React](https://react.dev/), and [Vite](https://vitejs.dev/).

## 🚀 Quick Start

To get the entire project running locally, follow these steps:

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [NPM](https://www.npmjs.com/)
- [MySQL](https://www.mysql.com/) database

### 2. Backend Setup (`inventory-be`)

Navigate to the backend directory and follow the [Backend README](./inventory-be/README.md).

```bash
cd inventory-be
npm install
# Configure .env (see .env.example)
npm run db:generate
npm run db:migrate
npm run dev
```

### 3. Frontend Setup (`inventory-fe`)

Navigate to the frontend directory and follow the [Frontend README](./inventory-fe/README.md).

```bash
cd inventory-fe
npm install
# Configure .env (see .env.example)
npm run dev
```

## 🛠️ Tech Stack

- **Backend**: Hono, Drizzle ORM, MySQL, Node.js, Zod, Scalar.
- **Frontend**: TanStack Router, TanStack Query, React, Tailwind CSS, Lucide React, Shadcn UI.

## 📖 Documentation

- [Product Requirements Document (PRD)](./inventory-be/docs/prd.md)
- [User Stories](./inventory-be/docs/user_stories.md)
- [OpenAPI Specification](./inventory-be/docs/openapi.json)

---

Developed with ❤️ by Berli.
