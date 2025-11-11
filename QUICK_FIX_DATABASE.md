# 🚨 Quick Fix: Database Tables Missing

You're getting a 500 error because the database tables haven't been created yet!

## ⚡ Quick Fix (2 Minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Click on your **Shajra project**
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"** button

### Step 2: Run the Database Migration

1. Open this file in your project: `/home/haider/shajra/supabase/migrations/001_initial_schema.sql`

2. **Copy EVERYTHING** from that file (it's about 390 lines)

3. **Paste** it into the Supabase SQL Editor

4. Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)

5. Wait for it to complete (should take 5-10 seconds)

6. You should see: ✅ **"Success. No rows returned"**

### Step 3: Verify Tables Were Created

1. In Supabase dashboard, click **"Table Editor"** (left sidebar)

2. You should now see these 4 tables:
   - ✅ `profiles`
   - ✅ `family_trees`
   - ✅ `family_members`
   - ✅ `relationships`

### Step 4: Refresh Your App

1. Go back to your app: http://localhost:3000
2. Refresh the page (F5 or Ctrl+R)
3. The error should be gone!

---

## 🎯 What This Does

The migration creates:
- **4 database tables** for your family tree data
- **Row Level Security (RLS) policies** so users can only see their own data
- **Automatic triggers** for updating timestamps
- **Indexes** for better performance
- **A profile for each user** automatically when they sign up

---

## ❓ Troubleshooting

### Issue: "permission denied for schema public"

**Solution:**
1. In Supabase, go to **Database** → **Roles**
2. Make sure the `postgres` role has proper permissions
3. Or try running the migration as the project owner

### Issue: "relation already exists"

**Solution:**
- Tables already exist!
- The error might be something else
- Check the browser console for more details
- Check Supabase logs: **Logs** → **Postgres Logs**

### Issue: Migration fails with syntax error

**Solution:**
1. Make sure you copied the ENTIRE file
2. Don't copy any line numbers (should start with `-- Shajra Family Tree Application`)
3. Make sure no extra characters were added

### Issue: Still getting 500 error after migration

**Solution:**
1. Open browser console (F12)
2. Look for the actual error message
3. Check Supabase logs: **Logs** → **API Logs**
4. Verify your `.env` file has correct SUPABASE_URL and SUPABASE_KEY

---

## 📋 Quick Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Copied all 390 lines from `001_initial_schema.sql`
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run"
- [ ] Saw success message
- [ ] Verified 4 tables exist in Table Editor
- [ ] Refreshed the app
- [ ] Error is gone!

---

## 🎉 After This Fix

Your app will work correctly and you'll be able to:
- Create family trees
- Add family members
- View the beautiful family tree visualization
- All data will be stored in your Supabase database

---

**Need the migration file?**
Location: `/home/haider/shajra/supabase/migrations/001_initial_schema.sql`

**Still having issues?**
Check: `/home/haider/shajra/SUPABASE_SETUP.md` for detailed instructions
