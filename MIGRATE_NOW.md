# Quick Migration Guide

Your database needs migrations to be run. Here's the fastest way:

## Option 1: Run Migrations Locally (Recommended)

1. **Get your Postgres connection string from Vercel:**
   - Go to: https://vercel.com/dashboard
   - Your Project → **Storage** → Your Postgres Database
   - Click **".env.local"** tab
   - Copy the connection string (looks like `postgresql://...`)

2. **Run the migration script:**
   ```bash
   ./run-migrations.sh "your-connection-string-here"
   ```

   Or manually:
   ```bash
   export DATABASE_URL="your-connection-string-here"
   cd backend
   npx prisma migrate deploy
   ```

## Option 2: Use Vercel CLI

If you have the connection string, you can also run:

```bash
# Set the connection string
export DATABASE_URL="your-connection-string-from-vercel-storage"

# Run migrations
cd backend
npx prisma migrate deploy
```

## Option 3: SQL Direct (If migrations don't work)

If you prefer, you can run the SQL directly in your Postgres database. The migration file is at:
`backend/prisma/migrations/20260104233840_init/migration.sql`

---

**After running migrations, try creating a task again - it should work!**
