#!/bin/bash

echo "🗄️  Running Shajra Database Migration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load environment
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Extract project ref
PROJECT_REF=$(echo $SUPABASE_URL | sed -n 's/.*https:\/\/\([^.]*\).*/\1/p')

echo "📋 Project: $PROJECT_REF"
echo "🔗 URL: $SUPABASE_URL"
echo ""

# Instructions
echo "📝 To run the migration:"
echo ""
echo "1. Copy this file content:"
echo "   cat supabase/migrations/001_initial_schema.sql"
echo ""
echo "2. Open this URL:"
echo "   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
echo ""
echo "3. Paste the SQL and click 'Run'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Or run this command to see the SQL:"
echo "cat supabase/migrations/001_initial_schema.sql"
