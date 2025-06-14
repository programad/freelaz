# 🇧🇷 Brazilian Freelancer Rate Calculator

A modern, intelligent rate calculator for Brazilian freelancers working with international clients. Built as a monorepo with React frontend and Cloudflare Workers API.

## 🏗️ Project Structure

```
brazilian-rate-calculator/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── api/          # Hono + Cloudflare Workers API
├── packages/
│   ├── shared/       # Shared types and utilities
│   └── config/       # Shared configurations (future)
└── scripts/
    └── sync-env.js   # Environment synchronization
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm (comes with Node.js)

### Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd brazilian-rate-calculator
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   # Copy the example file
   cp .env.example .env

   # Edit .env with your values
   # At minimum, set VITE_ANALYTICS_ID if you want Google Analytics

   # Sync environment files to apps
   npm run sync-env
   ```

3. **Build shared packages:**

   ```bash
   npm run build --workspace=packages/shared
   ```

4. **Start development:**

   ```bash
   # Start both API and web app
   npm run dev:all

   # Or start individually:
   npm run dev:api    # API at http://localhost:8787
   npm run dev        # Web app at http://localhost:5173
   ```

## 🔧 Environment Variables

The project uses a centralized environment management system:

### Root `.env` file:

- Contains all environment variables
- Synced to individual apps using `npm run sync-env`

### App-specific files (auto-generated):

- **Web app** (`apps/web/.env`): Only `VITE_` prefixed variables
- **API** (`apps/api/.dev.vars`): Non-VITE, non-analytics variables

### Required Variables:

```bash
# Web App (optional but recommended)
VITE_ANALYTICS_ID=G-XXXXXXXXXX      # Google Analytics 4 ID
VITE_API_URL=http://localhost:8787   # API URL for development

# API
API_BASE_URL=http://localhost:8787   # Internal API base URL

# Deployment (for production)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

## 📦 Available Scripts

### Root level:

- `npm run dev` - Start web app
- `npm run dev:api` - Start API
- `npm run dev:all` - Start both API and web app
- `npm run build` - Build web app
- `npm run sync-env` - Sync environment variables
- `npm run type-check` - Type check all workspaces

### Web app (`apps/web`):

- `npm run dev --workspace=apps/web`
- `npm run build --workspace=apps/web`
- `npm run preview --workspace=apps/web`

### API (`apps/api`):

- `npm run dev --workspace=apps/api`
- `npm run build --workspace=apps/api`
- `npm run deploy --workspace=apps/api`

## 🌐 Deployment

### Web App (Cloudflare Pages):

```bash
npm run build --workspace=apps/web
npm run deploy:web
```

### API (Cloudflare Workers):

```bash
npm run deploy:api
```

## 🏛️ Architecture

### Frontend (React + Vite)

- Modern React 18 with TypeScript
- Tailwind CSS for styling
- Responsive design
- Google Analytics integration
- PWA ready

### Backend (Hono + Cloudflare Workers)

- Serverless API with Hono framework
- TypeScript throughout
- CORS enabled
- Future: D1 database integration

### Shared Package

- Common types and interfaces
- Utility functions
- Data constants (states, professions)
- Centralized business logic

## 🔄 Environment Sync System

The `sync-env.js` script automatically:

1. **Web App**: Syncs only `VITE_` prefixed variables to `apps/web/.env`
2. **API**: Syncs non-VITE, non-analytics variables to `apps/api/.dev.vars`
3. **Excludes**: Cloudflare deployment variables (handled by `wrangler.toml`)

Run `npm run sync-env` after updating the root `.env` file.

## 🧪 Development

### Type Checking

```bash
npm run type-check  # All workspaces
npm run type-check --workspace=apps/web  # Web only
npm run type-check --workspace=apps/api  # API only
```

### Building

```bash
npm run build --workspace=packages/shared  # Build shared package first
npm run build --workspace=apps/web         # Build web app
npm run build --workspace=apps/api         # Build API
```

## 📝 Notes

- The API uses `.dev.vars` for Cloudflare Workers local development
- Web app requires `VITE_` prefix for client-side environment variables
- Shared package must be built before other packages can use it
- All TypeScript configurations extend from workspace-specific configs

## 🤝 Contributing

1. Make sure all type checks pass: `npm run type-check`
2. Build shared package after changes: `npm run build --workspace=packages/shared`
3. Sync environment variables: `npm run sync-env`
4. Test both web and API: `npm run dev:all`

## 📄 License

MIT License - see LICENSE file for details.
