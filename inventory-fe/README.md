# Inventory Frontend (inventory-fe)

This is the frontend application for Project Dewi, built with [TanStack Router](https://tanstack.com/router/latest) and [React](https://react.dev/).

## 🛠️ Tech Stack

- **Framework**: [TanStack Router](https://tanstack.com/router/latest)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Motion](https://motion.dev/)

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [NPM](https://www.npmjs.com/)

### 2. Installation

```bash
npm install
```

### 3. Environment Configuration

Copy the `.env.example` file to `.env` and configure your backend API URL:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL of the backend API | `http://localhost:3001` |
| `VITE_PUBLIC_URL` | Public URL of this application | `http://localhost:3000` |

### 4. Running the Application

```bash
# Development mode
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000) (as configured in `package.json`).

## 🛠️ Available Scripts

- `npm run dev`: Starts the development server with hot-reload.
- `npm run build`: Compiles the application for production.
- `npm run preview`: Previews the production build locally.
- `npm run test`: Runs unit tests using [Vitest](https://vitest.dev/).
- `npm run lint`: Runs [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) to check for code issues.
- `npm run format`: Fixes linting issues automatically.

## 📂 Project Structure

- `src/routes/`: File-based routing (TanStack Router).
- `src/components/`: Reusable React components.
- `src/hooks/`: Custom React hooks.
- `src/styles/`: Global CSS and Tailwind configuration.
- `public/`: Static assets.

## 📖 Learn More

- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [React Documentation](https://react.dev/)
