#!/bin/bash

# Script to run Prisma migrations for Vercel deployment
# Usage: ./run-migrations.sh [DATABASE_URL]

set -e

echo "🗄️  Running Prisma migrations..."

if [ -z "$1" ]; then
    echo "📋 Please provide DATABASE_URL as an argument"
    echo "   You can get it from: Vercel Dashboard → Storage → Your Postgres DB → .env.local tab"
    echo ""
    echo "Usage: ./run-migrations.sh 'postgresql://...'"
    exit 1
fi

export DATABASE_URL="$1"

cd backend

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "📦 Running migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed successfully!"
echo ""
echo "Your database is now ready to use!"
