# Deployment Guide - Life OS Dashboard

This guide will walk you through deploying the Life OS Dashboard to Vercel with a PostgreSQL database.

## Prerequisites

- A GitHub account (for connecting to Vercel)
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A PostgreSQL database (options: Vercel Postgres, Neon, or Supabase)

## Step 1: Set Up PostgreSQL Database

Choose one of the following database providers:

### Option A: Vercel Postgres (Recommended - Integrated)

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Create a new Postgres database
4. Note the connection string (you'll need this later)

### Option B: Neon (Free Tier Available)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. Format: `postgresql://user:password@host/database?sslmode=require`

### Option C: Supabase (Free Tier Available)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (URI format)

## Step 2: Prepare Your Repository

1. Ensure all changes are committed to your Git repository:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. Make sure your repository is pushed to GitHub (Vercel works best with GitHub)

## Step 3: Deploy to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the project structure
5. **Important for Monorepo**: In the project settings, ensure:
   - Root Directory: Leave as root (`.`)
   - Build Command: Vercel will use the `vercel-build` scripts from `package.json` files
   - Output Directory: Vercel will handle this automatically based on `vercel.json`

### Method 2: Via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project

## Step 4: Configure Environment Variables

In your Vercel project dashboard, go to Settings → Environment Variables and add:

### Required Variables

- **DATABASE_URL**: Your PostgreSQL connection string
  - Example: `postgresql://user:password@host:5432/database?sslmode=require`
  - For Vercel Postgres, this is automatically provided as `POSTGRES_PRISMA_URL`

- **CRON_SECRET**: A secret token for securing cron endpoints (generate a random string)
  - Example: `your-random-secret-token-here`
  - You can generate one with: `openssl rand -base64 32`

- **VITE_API_URL**: Frontend API base URL (optional - defaults to `/api` in production)
  - If not set, the frontend will use a relative URL `/api` which works automatically on Vercel
  - For custom domains or specific configurations: `https://your-app.vercel.app/api`
  - Note: Vite embeds env vars at build time, so set this before building if needed

### Optional Variables

- **NEWS_API_KEY**: Your News API key (only if using News API features)
  - Get one at [newsapi.org](https://newsapi.org/)

- **NODE_ENV**: Set to `production` (usually set automatically by Vercel)

### Setting Variables

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select "Production", "Preview", and "Development" as needed
4. Click "Save"

## Step 5: Run Database Migrations

After your first deployment, you need to run Prisma migrations to set up your database schema.

### Option 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI if you haven't already:
   ```bash
   npm i -g vercel
   ```

2. Link your local project to Vercel:
   ```bash
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

4. Update your local `.env` file with the DATABASE_URL from Vercel

5. Run migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

### Option 2: Using Vercel Postgres CLI

If you're using Vercel Postgres:

1. Install Vercel Postgres CLI:
   ```bash
   npm i -g @vercel/postgres
   ```

2. Connect to your database:
   ```bash
   vercel postgres connect
   ```

3. Run migrations manually or use Prisma Studio

### Option 3: Using a Migration Script

Create a one-time migration script that runs on deployment:

1. Add a script to `backend/package.json`:
   ```json
   "postinstall": "prisma generate && prisma migrate deploy"
   ```

2. Note: This runs on every deployment, so ensure migrations are idempotent

## Step 6: Verify Deployment

1. Visit your Vercel deployment URL (provided after deployment)
2. Check the health endpoint: `https://your-app.vercel.app/api/health`
3. Test the frontend and API endpoints
4. Check Vercel logs for any errors:
   - Go to your project → Deployments → Click on a deployment → View Function Logs

## Step 7: Configure Custom Domain (Optional)

1. Go to your project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning (automatic)

## Cron Jobs Configuration

The app includes a cron job that refreshes news daily. This is configured in `vercel.json`:

```json
"crons": [
  {
    "path": "/api/cron/refresh-news",
    "schedule": "0 0 * * *"
  }
]
```

**Vercel Plan Limitations**: 
- **Hobby (Free) Plan**: Supports daily cron jobs only (runs once per day at midnight UTC)
- **Pro Plan and Above**: Supports more frequent schedules (hourly, every 15 minutes, etc.)

**For More Frequent Updates on Hobby Plan**:

If you need news to refresh more often than daily, you can use external cron services:

1. **EasyCron** (https://www.easycron.com/)
   - Free tier available
   - Set up to call: `https://your-app.vercel.app/api/cron/refresh-news`
   - Add header: `Authorization: Bearer YOUR_CRON_SECRET`

2. **Cron-job.org** (https://cron-job.org/)
   - Free tier available
   - Configure HTTP request with Authorization header

3. **GitHub Actions** (https://github.com/features/actions)
   - Free for public repos
   - Create a workflow that calls your endpoint on a schedule

**Manual Refresh**: Users can also manually refresh news by clicking the "Refresh News" button in the app, which calls `/api/news/refresh` directly.

## Troubleshooting

### Database Connection Issues

- **Error**: "Can't reach database server"
  - **Solution**: Check your DATABASE_URL format and ensure SSL is enabled (`?sslmode=require`)
  - Verify database is accessible from the internet (not behind a firewall)

- **Error**: "Migration failed"
  - **Solution**: Ensure you've run `prisma generate` before migrations
  - Check that DATABASE_URL is correctly set in Vercel environment variables

### Build Failures

- **Error**: "Cannot find module"
  - **Solution**: Ensure all dependencies are in `package.json` (not just devDependencies)
  - Check that `vercel-build` scripts are correctly configured

- **Error**: "Prisma Client not generated"
  - **Solution**: The `vercel-build` script should include `prisma generate`
  - Verify `backend/package.json` has the `vercel-build` script

### API Routes Not Working

- **Error**: 404 on API routes
  - **Solution**: Check `vercel.json` routes configuration
  - Ensure API routes are prefixed with `/api/`
  - Verify the serverless function is built correctly

### Frontend Can't Connect to API

- **Error**: CORS or connection errors
  - **Solution**: Set `VITE_API_URL` environment variable in Vercel
  - For production, it should be: `https://your-app.vercel.app/api`
  - Ensure CORS is enabled in the backend (already configured)

## Local Development After Deployment

To run locally with production database:

1. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

2. Copy to your `.env` files:
   ```bash
   # Backend
   cp .env.local backend/.env
   
   # Frontend (if needed)
   cp .env.local frontend/.env
   ```

3. Update `frontend/.env`:
   ```
   VITE_API_URL=http://localhost:3001/api
   ```

4. Run locally:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Environment Variables Reference

### Backend (.env)

```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
PORT=3001
NEWS_API_KEY=your_key_here (optional)
CRON_SECRET=your_secret_here
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:3001/api (local) or https://your-app.vercel.app/api (production)
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Cron Documentation](https://vercel.com/docs/cron-jobs)

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify all environment variables are set correctly
3. Ensure database migrations have been run
4. Check that your database is accessible from the internet
