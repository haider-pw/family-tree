# Supabase Database Migrations

This directory contains database migration files for the Shajra application.

## Migrations

### 001_initial_schema.sql

Creates the initial database schema including:

#### Tables

1. **profiles** - User profile information
   - Extends `auth.users` with additional metadata
   - Automatically created when user signs up

2. **family_trees** - Family tree collections
   - Users can have multiple trees
   - One tree can be marked as default
   - Cascade deletes to members and relationships

3. **family_members** - Individual people in family trees
   - Contains name, gender, birth/death years, image, notes
   - Belongs to one tree
   - Cascade deletes to relationships

4. **relationships** - Connections between family members
   - Types: spouse, parent, child
   - Stored once but represents bidirectional relationships
   - Cascade deletes when members are deleted

#### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Policies for SELECT, INSERT, UPDATE, DELETE operations

#### Triggers

- `update_updated_at_column` - Auto-updates timestamps
- `handle_new_user` - Creates profile on user signup
- `ensure_single_default_tree` - Maintains one default tree per user

#### Indexes

Created on:
- Foreign keys (tree_id, user_id, member_id)
- Frequently queried columns (gender, is_default)
- Composite indexes for common query patterns

## Running Migrations

### Method 1: Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `001_initial_schema.sql`
5. Paste and click **Run**

### Method 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize (if not already done)
supabase init

# Link to your project
supabase link --project-ref your-project-id

# Generate types (optional but recommended)
supabase gen types typescript --project-id your-project-id > types/database.types.ts

# Push to remote
supabase db push
```

### Method 3: Node.js Script

```javascript
// scripts/run-migration.js
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Note: Use service key for migrations
)

const sql = readFileSync('./supabase/migrations/001_initial_schema.sql', 'utf8')

const { data, error } = await supabase.rpc('exec_sql', { sql })

if (error) {
  console.error('Migration failed:', error)
} else {
  console.log('Migration successful!')
}
```

## Rollback

If you need to rollback the migration:

```sql
-- Drop all tables (WARNING: This deletes all data!)
DROP TABLE IF EXISTS public.relationships CASCADE;
DROP TABLE IF EXISTS public.family_members CASCADE;
DROP TABLE IF EXISTS public.family_trees CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.ensure_single_default_tree() CASCADE;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_family_trees_updated_at ON public.family_trees;
DROP TRIGGER IF EXISTS update_family_members_updated_at ON public.family_members;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS maintain_single_default_tree ON public.family_trees;

-- Drop all views
DROP VIEW IF EXISTS public.family_members_with_tree;
```

## Verifying Migration

After running the migration, verify:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'family_trees', 'family_members', 'relationships');

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Check triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Check indexes exist
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public';
```

## Testing Queries

After migration, test the schema:

```sql
-- Test profile creation (should auto-create on user signup)
-- Manually test:
INSERT INTO public.profiles (id, full_name)
VALUES (auth.uid(), 'Test User');

-- Test family tree creation
INSERT INTO public.family_trees (user_id, name, is_default)
VALUES (auth.uid(), 'Test Tree', true)
RETURNING *;

-- Test family member creation
INSERT INTO public.family_members (tree_id, name, gender)
VALUES ('tree-uuid-here', 'Test Person', 'M')
RETURNING *;

-- Test relationship creation
INSERT INTO public.relationships (tree_id, member_id, related_member_id, relationship_type)
VALUES ('tree-uuid', 'member1-uuid', 'member2-uuid', 'parent')
RETURNING *;
```

## Data Import

To import existing data:

```sql
-- Example: Import from JSON
INSERT INTO public.family_members (tree_id, name, gender, birth_year)
SELECT
  'your-tree-uuid'::uuid,
  data->>'name',
  data->>'gender',
  (data->>'birth_year')::integer
FROM json_array_elements('[
  {"name": "John Doe", "gender": "M", "birth_year": 1950},
  {"name": "Jane Doe", "gender": "F", "birth_year": 1955}
]'::json) AS data;
```

## Backup

Before making changes, create a backup:

```bash
# Using Supabase CLI
supabase db dump > backup.sql

# Or using pg_dump (if you have direct database access)
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

## Migration Checklist

- [ ] Backup existing data (if any)
- [ ] Review migration SQL file
- [ ] Test in development environment first
- [ ] Run migration in production
- [ ] Verify tables created
- [ ] Verify RLS policies active
- [ ] Verify triggers working
- [ ] Test CRUD operations
- [ ] Check application functionality
- [ ] Monitor for errors

## Troubleshooting

### Permission Denied

If you see permission errors:
1. Make sure you're using the service role key (not anon key)
2. Check that RLS policies are correctly defined
3. Verify the user is authenticated

### Trigger Not Firing

If triggers aren't working:
1. Check trigger is created: `SELECT * FROM pg_trigger;`
2. Verify trigger function exists
3. Test function manually: `SELECT handle_new_user();`

### Constraint Violations

If you get constraint errors:
1. Check foreign key relationships
2. Verify data types match
3. Ensure required fields are provided

## Next Steps

After successful migration:

1. Update `.env` with Supabase credentials
2. Run `yarn dev` to start application
3. Test signup/login functionality
4. Create sample family tree data
5. Verify data persistence

## Schema Diagram

```
                    ┌─────────────────┐
                    │   auth.users    │
                    │   (Supabase)    │
                    └────────┬────────┘
                             │
                             │ 1:1
                             ▼
                    ┌─────────────────┐
                    │    profiles     │
                    │                 │
                    └────────┬────────┘
                             │
                             │ 1:N
                             ▼
                    ┌─────────────────┐
                    │  family_trees   │
                    │                 │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    │ 1:N             │ 1:N
                    ▼                 ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ family_members   │  │  relationships   │
        │                  │  │                  │
        └──────────────────┘  └──────────────────┘
```

---

**Database Version**: 1.0.0
**Last Updated**: 2025-11-11
**Compatible with**: PostgreSQL 14+, Supabase
