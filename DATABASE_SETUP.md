# 🗄️ Database Setup Guide

Three ways to run your database migrations - choose the one that works best for you!

---

## ⚡ Method 1: Supabase CLI (Recommended - Most Professional)

The Supabase CLI is the best way to manage migrations professionally.

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
# or
brew install supabase/tap/supabase  # macOS
```

### Step 2: Link Your Project

```bash
supabase link --project-ref your-project-ref
```

**Where to find project-ref:**
- Go to Supabase Dashboard → Project Settings → General
- Copy the "Reference ID"
- Or extract from your SUPABASE_URL: `https://[project-ref].supabase.co`

### Step 3: Push Migrations

```bash
supabase db push
```

That's it! The CLI will:
- ✅ Run all migrations in the correct order
- ✅ Track which migrations have been applied
- ✅ Show detailed progress and errors
- ✅ Work with version control

### Benefits:
- 🎯 Professional migration management
- 📊 Migration history tracking
- 🔄 Easy to rollback if needed
- 👥 Team-friendly (works with Git)
- 🚀 Works in CI/CD pipelines

---

## 🔧 Method 2: Use Our Setup Script

We've created a simple script you can run from your project.

### Quick Setup:

```bash
yarn db:setup
```

or

```bash
bash scripts/run-migration.sh
```

### What This Does:
- Loads your `.env` file
- Reads the migration file
- Attempts to run it via psql (if installed)
- Shows helpful instructions if it can't run automatically

### Requirements:
- `.env` file with `SUPABASE_URL` and `SUPABASE_KEY`
- Optionally: `psql` installed for direct execution

---

## 📝 Method 3: Manual Copy-Paste (Easiest, One-Time)

If you just want to get started quickly:

### Steps:

1. **Open Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   → Your Project
   → SQL Editor (left sidebar)
   → New Query
   ```

2. **Copy Migration File**
   - Open: `/home/haider/shajra/supabase/migrations/001_initial_schema.sql`
   - Select All (Ctrl+A / Cmd+A)
   - Copy (Ctrl+C / Cmd+C)

3. **Paste and Run**
   - Paste into SQL Editor
   - Click "Run" button (or Ctrl+Enter)
   - Wait 10-15 seconds
   - Should see: ✅ "Success. No rows returned"

4. **Verify**
   - Go to Table Editor
   - Check for these tables:
     - ✅ profiles
     - ✅ family_trees
     - ✅ family_members
     - ✅ relationships

---

## 🎯 Which Method Should I Use?

### Use **Supabase CLI** if:
- ✅ You're building for production
- ✅ You work in a team
- ✅ You want proper migration management
- ✅ You'll have more migrations in the future

### Use **Setup Script** if:
- ✅ You want quick automation
- ✅ You have psql installed
- ✅ You prefer command-line tools

### Use **Manual Copy-Paste** if:
- ✅ You just want to get started NOW
- ✅ It's a one-time setup
- ✅ You're not familiar with CLI tools

---

## 🔍 Verify Setup

After running any method, verify tables exist:

```bash
# In your app
curl http://localhost:3000/api/family-trees \
  -H "Cookie: your-session-cookie"

# Or just refresh your app at:
http://localhost:3000
```

If no errors appear, you're good to go! ✅

---

## 📚 Migration File Location

The migration file that creates all tables:
```
/home/haider/shajra/supabase/migrations/001_initial_schema.sql
```

This creates:
- **profiles** table (user profiles)
- **family_trees** table (multiple trees per user)
- **family_members** table (people in trees)
- **relationships** table (connections between people)
- Row Level Security (RLS) policies
- Triggers for automatic timestamps
- Indexes for performance

---

## ❓ Troubleshooting

### Issue: "relation already exists"

**Solution:**
Tables are already created! You're done. ✅

### Issue: "permission denied"

**Solution:**
Make sure you're using the correct Supabase credentials:
- Check `.env` file
- Verify `SUPABASE_URL` and `SUPABASE_KEY`
- Try using the service role key for admin access

### Issue: Script can't find .env file

**Solution:**
```bash
# Make sure you have a .env file:
ls -la .env

# If not, create it:
cp .env.example .env
# Then add your Supabase credentials
```

### Issue: psql not installed

**Solution:**
Install PostgreSQL client:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Or just use Method 1 (CLI) or Method 3 (Manual)
```

---

## 🚀 Next Steps

After database setup:

1. **Start dev server:**
   ```bash
   yarn dev
   ```

2. **Create an account:**
   ```
   http://localhost:3000/signup
   ```

3. **Start building your family tree!**

---

## 📖 Additional Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Project Setup Guide](./SUPABASE_SETUP.md)

---

**Quick Reference:**

```bash
# Install CLI
npm install -g supabase

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push

# Or use our script
yarn db:setup
```

---

**Last Updated:** 2025-11-11
**Difficulty:** Easy ⭐
**Time Required:** 5-10 minutes
