# Supabase Integration Setup Guide

This guide explains how to set up and use the Supabase integration for the Shajra family tree application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Running Migrations](#running-migrations)
5. [Testing the Integration](#testing-the-integration)
6. [Architecture Overview](#architecture-overview)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- A Supabase account (free tier works fine)
- Node.js and Yarn installed
- The Shajra application repository

## Database Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create a new account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: `shajra` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
5. Wait for the project to be created (takes 1-2 minutes)

### Step 2: Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Project API Key** (anon/public key)

### Step 3: Update Environment Variables

Create or update the `.env` file in the root of your project:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
```

**Important**: Never commit this file to version control. It's already in `.gitignore`.

## Running Migrations

### Option 1: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the migration file at `/supabase/migrations/001_initial_schema.sql`
5. Copy the entire contents of the file
6. Paste it into the SQL Editor
7. Click **Run** (or press Ctrl/Cmd + Enter)
8. Wait for the migration to complete (should take a few seconds)

You should see a success message indicating that the tables, indexes, and policies have been created.

### Option 2: Using Supabase CLI (Advanced)

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

## Verifying the Migration

After running the migration, verify that everything was created correctly:

1. In Supabase dashboard, go to **Table Editor**
2. You should see the following tables:
   - `profiles`
   - `family_trees`
   - `family_members`
   - `relationships`

3. Go to **Authentication** → **Policies** to verify Row Level Security (RLS) policies are active

## Testing the Integration

### 1. Sign Up a New User

1. Run your development server:
   ```bash
   yarn dev
   ```

2. Navigate to `http://localhost:3000/signup`
3. Create a new account with your email and password
4. You'll be redirected to the login page

### 2. Sign In

1. Go to `http://localhost:3000/login`
2. Sign in with your credentials
3. You should be redirected to the main page (`/`)

### 3. Verify Database

1. Go to Supabase dashboard → **Table Editor** → `profiles`
2. You should see your newly created user profile
3. The `id` should match the user ID in **Authentication** → **Users**

### 4. Create Sample Data (Optional)

You can create a sample family tree using the browser console:

```javascript
// Open browser console (F12) on the main page and run:

const store = useFamilyTreeStore();

// Create a family tree
await store.createTree({
  name: "My Family Tree",
  description: "Our family lineage",
  is_default: true
});

// Create a family member
await store.createMember({
  tree_id: store.activeTreeId,
  name: "John Doe",
  gender: "M",
  birth_year: 1950
});
```

## Architecture Overview

### Database Schema

```
┌─────────────┐
│   auth.users│
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  profiles   │ (1:1 with auth.users)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│family_trees │ (1:N - user can have multiple trees)
└──────┬──────┘
       │
       ├→ ┌──────────────┐
       │  │family_members│ (N:1 - members belong to one tree)
       │  └──────┬───────┘
       │         │
       └→ ┌──────────────┐
          │relationships │ (N:1 - relationships within a tree)
          └──────────────┘
```

### Application Layers

1. **Database Layer** (Supabase)
   - PostgreSQL database with Row Level Security
   - Automatic profile creation on user signup
   - Cascade deletes to maintain referential integrity

2. **API Layer** (`/server/api/`)
   - RESTful API endpoints for CRUD operations
   - Authentication middleware (`requireUserSession`)
   - Input validation and error handling

3. **Composables Layer** (`/composables/`)
   - `useFamilyTree.ts` - Family tree operations
   - `useFamilyMembers.ts` - Member and relationship operations
   - Data transformation for family-chart library

4. **State Management Layer** (`/stores/`)
   - `familyTree.ts` - Pinia store for global state
   - Caching and optimistic updates
   - Persistence to localStorage

5. **Presentation Layer** (`/pages/` and `/components/`)
   - Vue 3 components with Composition API
   - Family tree visualization with `family-chart` library
   - Responsive UI with Tailwind CSS

## API Endpoints

### Family Trees

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/family-trees` | Get all trees for current user |
| POST | `/api/family-trees` | Create a new tree |
| GET | `/api/family-trees/:id` | Get specific tree with members |
| PATCH | `/api/family-trees/:id` | Update a tree |
| DELETE | `/api/family-trees/:id` | Delete a tree |

### Family Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/family-members` | Create a new member |
| PATCH | `/api/family-members/:id` | Update a member |
| DELETE | `/api/family-members/:id` | Delete a member |

### Request/Response Examples

#### Create a Family Tree

```bash
POST /api/family-trees
Content-Type: application/json

{
  "name": "Smith Family Tree",
  "description": "Our family history",
  "is_default": true
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "user_id": "user-uuid",
    "name": "Smith Family Tree",
    "description": "Our family history",
    "is_default": true,
    "created_at": "2024-11-11T...",
    "updated_at": "2024-11-11T..."
  },
  "message": "Family tree created successfully"
}
```

#### Create a Family Member

```bash
POST /api/family-members
Content-Type: application/json

{
  "tree_id": "tree-uuid",
  "name": "John Smith",
  "gender": "M",
  "birth_year": 1950,
  "death_year": null,
  "img": "https://example.com/avatar.jpg",
  "notes": "Grandfather"
}
```

## Troubleshooting

### Issue: "User not authenticated" errors

**Solution**: Make sure you're logged in and the session is valid. Check:
1. Browser cookies are enabled
2. You're not in incognito/private mode
3. Session hasn't expired (default: 1 hour)

### Issue: RLS policy violations

**Symptoms**: "permission denied" or "row-level security policy violation"

**Solution**:
1. Verify RLS policies were created correctly
2. Check that user is authenticated
3. Ensure the data belongs to the authenticated user

### Issue: Migration fails

**Solution**:
1. Check for syntax errors in SQL
2. Ensure no conflicting table/function names exist
3. Try dropping existing tables first (only in development!)
4. Check Supabase logs in dashboard

### Issue: API endpoints return 404

**Solution**:
1. Verify the API route files exist in `/server/api/`
2. Check file naming conventions (must end with `.get.ts`, `.post.ts`, etc.)
3. Restart the development server

### Issue: Data not showing in UI

**Solution**:
1. Check browser console for errors
2. Verify store is initialized (`await store.initialize()`)
3. Check that tree and members exist in database
4. Ensure `chartData` is being populated correctly

## Security Best Practices

1. **Never commit `.env` file** - Use `.env.example` for documentation
2. **Use RLS policies** - All data access is controlled at database level
3. **Validate inputs** - Both client and server-side validation
4. **Use authentication middleware** - All API routes use `requireUserSession()`
5. **Keep dependencies updated** - Regularly update Supabase and Nuxt modules

## Performance Optimization

1. **Indexes**: Already created on foreign keys and frequently queried columns
2. **Caching**: Pinia store caches data to reduce API calls
3. **Lazy loading**: Members loaded only for active tree
4. **Optimistic updates**: UI updates immediately, syncs with server

## Next Steps

After setting up Supabase integration, consider:

1. **Adding more features**:
   - Photo upload to Supabase Storage
   - Sharing trees with other users
   - Exporting data to PDF/JSON
   - Import from GEDCOM files

2. **Improving security**:
   - Enable email verification
   - Add password reset functionality
   - Implement rate limiting

3. **Enhancing UX**:
   - Add member editing forms
   - Implement drag-and-drop for member creation
   - Add search and filter functionality
   - Create mobile-optimized views

## Support

If you encounter issues:

1. Check the Supabase [documentation](https://supabase.com/docs)
2. Review Nuxt 3 [documentation](https://nuxt.com/docs)
3. Check the project's GitHub issues
4. Reach out to the development team

---

**Last Updated**: 2025-11-11
**Version**: 1.0.0
