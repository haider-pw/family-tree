#!/bin/bash

# Simple shell script to run database migration
# This uses the Supabase Management API to execute SQL

set -e

echo ""
echo "🗄️  Running Shajra Database Migration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load environment variables from .env
if [ -f .env ]; then
    echo "📋 Loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with SUPABASE_URL and SUPABASE_KEY"
    exit 1
fi

# Check required variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Error: Missing environment variables!"
    echo "Please set SUPABASE_URL and SUPABASE_KEY in your .env file"
    exit 1
fi

echo "✅ Environment loaded"
echo ""

# Extract project ref from URL
PROJECT_REF=$(echo $SUPABASE_URL | sed -n 's/.*https:\/\/\([^.]*\).*/\1/p')
echo "📋 Project: $PROJECT_REF"
echo ""

# Read migration file
MIGRATION_FILE="supabase/migrations/001_initial_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📋 Reading migration file..."
echo "⏳ This will take a few seconds..."
echo ""

# Use psql if available (requires connection string)
if command -v psql &> /dev/null; then
    echo "🔧 Using psql..."

    # Note: This requires SUPABASE_DB_PASSWORD to be set
    if [ -z "$SUPABASE_DB_PASSWORD" ]; then
        echo "⚠️  SUPABASE_DB_PASSWORD not set"
        echo "To use psql, add your database password to .env"
        echo ""
        echo "Alternative: Run migration manually in Supabase Dashboard"
        echo "  1. Go to SQL Editor"
        echo "  2. Copy contents of $MIGRATION_FILE"
        echo "  3. Paste and click Run"
        exit 1
    fi

    DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"
    psql "$DB_URL" -f "$MIGRATION_FILE"

    if [ $? -eq 0 ]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ Migration completed successfully!"
        echo ""
        echo "Your database is ready to use!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    else
        echo "❌ Migration failed!"
        exit 1
    fi
else
    echo "⚠️  psql not installed"
    echo ""
    echo "To run migrations automatically, you have 2 options:"
    echo ""
    echo "Option 1: Install Supabase CLI (recommended)"
    echo "  npm install -g supabase"
    echo "  supabase link --project-ref $PROJECT_REF"
    echo "  supabase db push"
    echo ""
    echo "Option 2: Run manually in Supabase Dashboard"
    echo "  1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
    echo "  2. Click 'New Query'"
    echo "  3. Copy contents of: $MIGRATION_FILE"
    echo "  4. Paste and click 'Run'"
    echo ""
fi
