# Developer Guide - Supabase Integration

Quick reference guide for developers working with the Shajra Supabase integration.

## Quick Start

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
yarn dev
```

## Project Structure

```
shajra/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # Database schema
├── types/
│   └── database.ts                     # TypeScript types
├── composables/
│   ├── useFamilyTree.ts               # Tree CRUD operations
│   └── useFamilyMembers.ts            # Member CRUD operations
├── stores/
│   └── familyTree.ts                  # Pinia store
├── server/
│   └── api/
│       ├── family-trees/              # Tree API endpoints
│       │   ├── index.get.ts           # GET all trees
│       │   ├── index.post.ts          # POST create tree
│       │   ├── [id].get.ts            # GET tree by ID
│       │   ├── [id].patch.ts          # PATCH update tree
│       │   └── [id].delete.ts         # DELETE tree
│       └── family-members/            # Member API endpoints
│           ├── index.post.ts          # POST create member
│           ├── [id].patch.ts          # PATCH update member
│           └── [id].delete.ts         # DELETE member
├── pages/
│   ├── index.vue                      # Main page (family tree viewer)
│   ├── login.vue                      # Login page
│   └── signup.vue                     # Signup page
└── middleware/
    └── auth.ts                        # Authentication middleware
```

## Using the Pinia Store

The Pinia store is the recommended way to interact with family tree data.

### In a Vue Component

```vue
<script setup lang="ts">
import { useFamilyTreeStore } from '~/stores/familyTree'

const store = useFamilyTreeStore()

// Initialize on mount
onMounted(async () => {
  await store.initialize()
})

// Access reactive data
const trees = computed(() => store.trees)
const activeTree = computed(() => store.activeTree)
const members = computed(() => store.members)
const chartData = computed(() => store.chartData)
const loading = computed(() => store.loading)
const error = computed(() => store.error)

// Create a new tree
async function createTree() {
  await store.createTree({
    name: 'My Family Tree',
    description: 'Our family history',
    is_default: true
  })
}

// Create a new member
async function createMember() {
  await store.createMember({
    tree_id: store.activeTreeId!,
    name: 'John Doe',
    gender: 'M',
    birth_year: 1950
  })
}

// Switch to different tree
async function switchTree(treeId: string) {
  await store.setActiveTree(treeId)
}
</script>
```

## Using Composables

For more granular control, use the composables directly.

### useFamilyTree Composable

```typescript
import { useFamilyTree } from '~/composables/useFamilyTree'

const {
  trees,
  currentTree,
  loading,
  error,
  fetchTrees,
  fetchTreeWithMembers,
  createTree,
  updateTree,
  deleteTree,
  setCurrentTree,
} = useFamilyTree()

// Fetch all trees
await fetchTrees()

// Create a tree
const newTree = await createTree({
  name: 'New Tree',
  is_default: false
})

// Fetch tree with all data
const treeData = await fetchTreeWithMembers(treeId)

// Update a tree
await updateTree(treeId, {
  name: 'Updated Name'
})

// Delete a tree
await deleteTree(treeId)
```

### useFamilyMembers Composable

```typescript
import { useFamilyMembers } from '~/composables/useFamilyMembers'

const {
  members,
  relationships,
  loading,
  error,
  fetchMembers,
  createMember,
  updateMember,
  deleteMember,
  createRelationship,
  getChartData,
} = useFamilyMembers()

// Fetch members for a tree
await fetchMembers(treeId)

// Create a member
const newMember = await createMember({
  tree_id: treeId,
  name: 'Jane Doe',
  gender: 'F',
  birth_year: 1955,
  img: 'https://example.com/avatar.jpg'
})

// Update a member
await updateMember(memberId, {
  name: 'Jane Smith',
  death_year: 2020
})

// Create a relationship
await createRelationship({
  tree_id: treeId,
  member_id: parentId,
  related_member_id: childId,
  relationship_type: 'parent'
})

// Get chart-ready data
const chartData = await getChartData(treeId)
```

## API Endpoints

### Using in Server Routes

```typescript
// server/api/custom-endpoint.ts
export default defineEventHandler(async (event) => {
  // Require authentication
  const user = await requireUserSession(event)

  // Get Supabase client
  const supabase = await serverSupabaseClient(event)

  // Query database
  const { data, error } = await supabase
    .from('family_trees')
    .select('*')
    .eq('user_id', user.user.id)

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Database error'
    })
  }

  return { success: true, data }
})
```

### Using from Client

```typescript
// Using $fetch
const response = await $fetch('/api/family-trees', {
  method: 'POST',
  body: {
    name: 'My Tree',
    is_default: true
  }
})

// Using useFetch (for SSR compatibility)
const { data, pending, error } = await useFetch('/api/family-trees/123')
```

## Database Operations

### Direct Supabase Queries

```typescript
const supabase = useSupabaseClient()

// Insert
const { data, error } = await supabase
  .from('family_members')
  .insert({
    tree_id: 'uuid',
    name: 'John',
    gender: 'M'
  })
  .select()
  .single()

// Update
const { data, error } = await supabase
  .from('family_members')
  .update({ name: 'John Smith' })
  .eq('id', 'member-uuid')
  .select()
  .single()

// Delete
const { error } = await supabase
  .from('family_members')
  .delete()
  .eq('id', 'member-uuid')

// Query with filters
const { data, error } = await supabase
  .from('family_members')
  .select('*')
  .eq('tree_id', 'tree-uuid')
  .eq('gender', 'M')
  .order('birth_year', { ascending: true })
```

## TypeScript Types

All database types are defined in `/types/database.ts`.

```typescript
import type {
  FamilyTree,
  FamilyMember,
  Relationship,
  FamilyTreeInput,
  FamilyMemberInput,
  FamilyChartNode
} from '~/types/database'

// Using types
const tree: FamilyTree = {
  id: 'uuid',
  user_id: 'user-uuid',
  name: 'My Tree',
  description: null,
  is_default: true,
  created_at: '2024-11-11T...',
  updated_at: '2024-11-11T...'
}

// Input types for creating records
const treeInput: FamilyTreeInput = {
  name: 'New Tree',
  description: 'Description',
  is_default: false
}
```

## Common Patterns

### Loading States

```vue
<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div v-else>
    <!-- Your content -->
  </div>
</template>

<script setup lang="ts">
const store = useFamilyTreeStore()
const loading = computed(() => store.loading)
const error = computed(() => store.error)
</script>
```

### Error Handling

```typescript
try {
  await store.createMember({
    tree_id: treeId,
    name: 'John',
    gender: 'M'
  })

  // Success - show notification
  console.log('Member created successfully')
} catch (err) {
  // Error - show error message
  console.error('Failed to create member:', err)
  // You can access store.error for the error message
}
```

### Optimistic Updates

```typescript
// Add member to local state immediately
const tempMember = {
  id: 'temp-id',
  name: 'John',
  // ... other fields
}
store.members.push(tempMember)

try {
  // Save to database
  const savedMember = await store.createMember(memberInput)

  // Replace temp with real data
  const index = store.members.findIndex(m => m.id === 'temp-id')
  if (index !== -1) {
    store.members[index] = savedMember
  }
} catch (err) {
  // Remove temp member on error
  store.members = store.members.filter(m => m.id !== 'temp-id')
}
```

## Testing

### Unit Testing Composables

```typescript
import { describe, it, expect, vi } from 'vitest'
import { useFamilyTree } from '~/composables/useFamilyTree'

describe('useFamilyTree', () => {
  it('fetches trees successfully', async () => {
    const { fetchTrees, trees } = useFamilyTree()

    await fetchTrees()

    expect(trees.value).toBeDefined()
    expect(Array.isArray(trees.value)).toBe(true)
  })
})
```

### Testing API Endpoints

```bash
# Using curl
curl -X POST http://localhost:3000/api/family-trees \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Tree", "is_default": true}'

# Using httpie
http POST localhost:3000/api/family-trees \
  name="Test Tree" \
  is_default:=true
```

## Performance Tips

1. **Use Pinia store** - Caches data and reduces API calls
2. **Lazy load data** - Only fetch data when needed
3. **Use indexes** - Already created on foreign keys
4. **Batch operations** - When possible, batch multiple operations
5. **Optimize queries** - Use `select()` to fetch only needed fields

```typescript
// Good - only fetch needed fields
const { data } = await supabase
  .from('family_members')
  .select('id, name, gender')
  .eq('tree_id', treeId)

// Bad - fetches all fields
const { data } = await supabase
  .from('family_members')
  .select('*')
  .eq('tree_id', treeId)
```

## Debugging

### Enable Supabase Debug Logs

```typescript
// In your component or composable
const supabase = useSupabaseClient()

// Log all queries
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session)
})
```

### Check Store State

```javascript
// In browser console
const store = useFamilyTreeStore()
console.log('Trees:', store.trees)
console.log('Active Tree:', store.activeTree)
console.log('Members:', store.members)
console.log('Chart Data:', store.chartData)
```

### Inspect Database

```sql
-- In Supabase SQL Editor

-- Check all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Check user's trees
SELECT * FROM family_trees WHERE user_id = 'your-user-uuid';

-- Check members for a tree
SELECT * FROM family_members WHERE tree_id = 'tree-uuid';
```

## Best Practices

1. **Always use TypeScript types** - Provides type safety and autocomplete
2. **Handle errors gracefully** - Show user-friendly messages
3. **Validate inputs** - Both client and server-side
4. **Use authentication middleware** - Protect all API routes
5. **Keep composables pure** - No side effects, just data operations
6. **Use Pinia for shared state** - Better than prop drilling
7. **Follow Vue 3 patterns** - Composition API, `<script setup>`
8. **Test edge cases** - Empty states, error states, loading states

## Common Issues

### Issue: "Cannot read property of undefined"

Check if store is initialized:
```typescript
onMounted(async () => {
  await store.initialize()
})
```

### Issue: Data not reactive

Make sure you're using computed or refs:
```typescript
// Good
const trees = computed(() => store.trees)

// Bad
const trees = store.trees
```

### Issue: RLS violations

Ensure user is authenticated and data belongs to them:
```typescript
const user = useSupabaseUser()
if (!user.value) {
  // Handle unauthenticated state
}
```

## Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Last Updated**: 2025-11-11
