#!/bin/bash

# Setup script for Vercel deployment
# This script helps set up the database and run migrations

echo "🚀 Setting up Vercel deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Link to Vercel project
echo "🔗 Linking to Vercel project..."
vercel link

# Pull environment variables
echo "📥 Pulling environment variables..."
vercel env pull .env.local

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL=" .env.local 2>/dev/null; then
    echo "✅ DATABASE_URL found in .env.local"
    
    # Copy to backend/.env
    echo "📋 Copying DATABASE_URL to backend/.env..."
    grep "DATABASE_URL=" .env.local > backend/.env || echo "DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2-)" > backend/.env
    
    # Run migrations
    echo "🗄️  Running database migrations..."
    cd backend
    npx prisma migrate deploy
    cd ..
    
    echo "✅ Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Visit your app: https://james-dashboard-67g9c1emv-james-larks-projects.vercel.app"
    echo "2. Test the API endpoints"
    echo "3. Add some data through the UI"
else
    echo "⚠️  DATABASE_URL not found. Please:"
    echo "1. Set up a PostgreSQL database (Vercel Postgres, Neon, or Supabase)"
    echo "2. Add DATABASE_URL to Vercel environment variables"
    echo "3. Run this script again"
fi
