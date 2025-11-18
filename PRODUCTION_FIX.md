# Production Deployment Fix Guide

## Issue Summary
The `/api/family-trees` endpoint is returning a 500 error on production (https://www.shajra.org) due to:
1. Missing database tables in the production Supabase instance
2. Potentially missing environment variables on the production server

## Solution Steps

### Step 1: Verify Environment Variables on Production (Vercel)

1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Click on "Environment Variables"
4. Ensure these variables are set for production:
   - `SUPABASE_URL` - Your Supabase project URL (e.g., https://xxxxx.supabase.co)
   - `SUPABASE_KEY` - Your Supabase anon/public key

If missing, add them and redeploy.

### Step 2: Run Database Migrations

The main issue is that the database tables don't exist on your production Supabase instance. You need to run the migration file located at `/supabase/migrations/001_initial_schema.sql`.

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your production Supabase project dashboard at https://supabase.com
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `/supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Wait for completion - you should see success messages

#### Option B: Using Supabase CLI

```bash
# If you haven't installed Supabase CLI yet
npm install -g supabase

# Link to your production project
supabase link --project-ref your-production-project-ref

# Run the migration
supabase db push --file supabase/migrations/001_initial_schema.sql
```

### Step 3: Verify the Fix

After running the migration, verify everything is working:

1. **Check tables exist**: In Supabase dashboard, go to **Table Editor** and verify these tables exist:
   - `profiles`
   - `family_trees`
   - `family_members`
   - `relationships`

2. **Test the health endpoint**: Visit https://www.shajra.org/api/health
   - It should show `"status": "healthy"` if everything is configured correctly

3. **Test the family-trees endpoint**: The `/api/family-trees` should now return:
   - A 401 error if not authenticated (expected)
   - Or an empty array with a warning message (based on the improved error handling)
   - But NOT a 500 error

### Step 4: Additional Production Considerations

1. **Authentication**: Once the tables are created, you may want to update the API endpoint to require authentication:
   - Edit `/server/api/family-trees/index.get.ts`
   - Comment out lines 52-58 (the part that returns empty array for unauthenticated users)
   - Uncomment lines 60-64 (the auth check that throws 401)

2. **Automatic Profile Creation**: Set up a trigger in Supabase to automatically create a profile when a user signs up:

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

3. **Row Level Security**: Verify RLS is enabled on all tables:
   - Go to **Authentication** → **Policies** in Supabase dashboard
   - Ensure RLS is enabled for all tables

## Monitoring

Use the `/api/health` endpoint to monitor your application's health:

```bash
curl https://www.shajra.org/api/health
```

Expected response when healthy:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-18T...",
  "checks": {
    "environment": true,
    "database": true,
    "tables": true
  }
}
```

## Troubleshooting

If issues persist after following these steps:

1. **Check Vercel logs**: View function logs in Vercel dashboard for detailed error messages
2. **Test locally**: Ensure your local environment works with the same Supabase instance
3. **Verify Supabase status**: Check if Supabase is experiencing any outages at https://status.supabase.com
4. **Check CORS settings**: Ensure your Supabase project allows requests from your domain

## Quick Commands

```bash
# Test health endpoint
curl https://www.shajra.org/api/health

# Test family-trees endpoint (will require authentication)
curl https://www.shajra.org/api/family-trees

# Check deployment status on Vercel
vercel logs --follow
```