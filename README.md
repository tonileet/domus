# Domus - Property Management System

[![CI Pipeline](https://github.com/tonileet/domus/actions/workflows/ci.yml/badge.svg)](https://github.com/tonileet/domus/actions/workflows/ci.yml)
[![Nightly Tests](https://github.com/tonileet/domus/actions/workflows/nightly-agents.yml/badge.svg)](https://github.com/tonileet/domus/actions/workflows/nightly-agents.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

A modern property management application built with React and Vite, featuring automated testing and CI/CD pipelines.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Testing
```bash
# Run linter
npm run lint

# Run unit tests
npm test

# Run E2E tests (requires Playwright)
npm run test:e2e

# Run all test agents
npm run test:agents
```

### Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

### Automated Checks (on every commit)
- ✅ **ESLint** - Code quality and style checks
- ✅ **Unit Tests** - Vitest with coverage reporting
- ✅ **E2E Tests** - Playwright browser tests
- ✅ **Build Verification** - Ensures the app builds successfully

### Nightly Checks
- 🌙 **Full Test Agent Analysis** - Comprehensive code quality report
- 🤖 **Automated Issue Creation** - Creates GitHub issues when tests fail

### Workflow Files
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) - Main CI pipeline
- [`.github/workflows/nightly-agents.yml`](.github/workflows/nightly-agents.yml) - Scheduled test agents

### Pull Request Integration
Pull requests automatically receive:
- Linting results
- Test coverage reports
- E2E test results
- Build status

To trigger additional agent analysis in a PR, include `[run-agents]` in your commit message.

## Data Privacy & Public Persistence

This application is designed to be maintained in a public repository without leaking your personal data.

### Where is my data?
- **All data** (properties, tenants, costs, etc.) is stored locally in your browser's **IndexedDB**.
- It is **never** sent to a server or stored as files within this repository.
- This means your data stays on your machine and is not tracked by Git.

### Critical Safety Rules
1. **Never** put real personal information in `src/db/migration.js`. This file is for library defaults or demo data and **will** be committed.
2. If you want to export data for backup, save it in the `data/` folder (which is ignored by Git) or anywhere outside this project directory.
3. Be careful when sharing screenshots of the application if it contains real tenant or property details.

### Backup & Restore
(Coming Soon) Export/Import functionality to easily move your data between browsers or devices.

