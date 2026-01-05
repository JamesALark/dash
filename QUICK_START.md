# Quick Start - Deploy to Vercel

## Step 1: Push to GitHub ✅ (In Progress)

Your code is ready to push. Run:
```bash
git push -u origin main
```

If you need to authenticate, use GitHub CLI:
```bash
gh auth login
```

## Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Import repository: `JamesALark/dash`
4. Vercel will auto-detect the configuration

## Step 3: Set Up Database

### Option A: Vercel Postgres (Easiest)
- In Vercel dashboard → Storage → Create Database → Postgres
- Connection string is automatically provided

### Option B: Neon (Free Tier)
1. Sign up at https://neon.tech
2. Create project
3. Copy connection string

### Option C: Supabase (Free Tier)
1. Sign up at https://supabase.com
2. Create project
3. Get connection string from Settings → Database

## Step 4: Configure Environment Variables

In Vercel project → Settings → Environment Variables, add:

1. **DATABASE_URL**
   - Vercel Postgres: Use `POSTGRES_PRISMA_URL` (auto-provided)
   - Neon/Supabase: Your connection string
   - Format: `postgresql://user:password@host:5432/database?sslmode=require`

2. **CRON_SECRET**
   - Generate: `openssl rand -base64 32`
   - Or use any random secure string

3. **NEWS_API_KEY** (Optional)
   - Only if using News API features
   - Get from https://newsapi.org/

## Step 5: Run Database Migrations

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Update backend/.env with DATABASE_URL
# Then run migrations
cd backend
npx prisma migrate deploy
```

## Step 6: Verify Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Check health: `https://your-app.vercel.app/api/health`
3. Test the app!

## Troubleshooting

- **Build fails?** Check Vercel logs in dashboard
- **Database connection issues?** Verify DATABASE_URL format and SSL mode
- **API not working?** Check that migrations ran successfully

See `DEPLOYMENT.md` for detailed instructions.
