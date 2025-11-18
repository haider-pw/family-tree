# System Trees Architecture - Public Sadaat Shajra

## Overview

This document describes the architecture for a two-tier genealogy system:
1. **System-level official Shajra** (read-only, moderated)
2. **User private trees** (unlimited, fully editable)

---

## 🗄️ **Enhanced Database Schema**

### **1. Tree Types & Permissions**

```sql
-- Add tree_type and ownership columns
ALTER TABLE family_trees
ADD COLUMN tree_type TEXT DEFAULT 'user' CHECK (tree_type IN ('system', 'user')),
ADD COLUMN is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN created_by UUID REFERENCES auth.users(id),
ADD COLUMN managed_by UUID[] DEFAULT '{}'; -- Array of moderator user IDs

-- System trees are managed by specific users
CREATE INDEX idx_family_trees_type ON family_trees(tree_type);
CREATE INDEX idx_family_trees_public ON family_trees(is_public);

COMMENT ON COLUMN family_trees.tree_type IS 'system = official/public tree, user = private tree';
COMMENT ON COLUMN family_trees.is_public IS 'Whether tree is publicly viewable';
COMMENT ON COLUMN family_trees.managed_by IS 'User IDs of moderators who can edit this tree';
```

### **2. User Roles**

```sql
-- User roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Function to check if user is admin/moderator
CREATE FUNCTION is_moderator(user_uuid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid
    AND role IN ('admin', 'moderator')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user can edit a specific tree
CREATE FUNCTION can_edit_tree(tree_uuid UUID, user_uuid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_trees
    WHERE id = tree_uuid
    AND (
      -- User owns the tree
      user_id = user_uuid
      -- Or user is a moderator of this tree
      OR user_uuid = ANY(managed_by)
      -- Or user is admin/moderator globally
      OR is_moderator(user_uuid)
    )
  );
$$ LANGUAGE SQL SECURITY DEFINER;
```

### **3. Pending Contributions (Moderation Queue)**

```sql
-- Pending member additions
CREATE TABLE pending_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID REFERENCES family_trees(id) ON DELETE CASCADE,

  -- Member data (same structure as family_members)
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  birth_year INTEGER,
  death_year INTEGER,
  img TEXT,
  notes TEXT,

  -- Connection info
  parent_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  connection_type TEXT CHECK (connection_type IN ('child', 'spouse')),

  -- Metadata
  submitted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Proof/documentation
  proof_documents TEXT[], -- URLs to uploaded documents

  CONSTRAINT valid_review CHECK (
    (status = 'pending' AND reviewed_by IS NULL) OR
    (status IN ('approved', 'rejected') AND reviewed_by IS NOT NULL)
  )
);

CREATE INDEX idx_pending_members_tree ON pending_members(tree_id);
CREATE INDEX idx_pending_members_status ON pending_members(status);
CREATE INDEX idx_pending_members_submitted_by ON pending_members(submitted_by);

-- Connection requests (when user wants to connect to existing member)
CREATE TABLE connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID REFERENCES family_trees(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE, -- Who they're claiming to be child of

  -- Requester info
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  relationship_type TEXT CHECK (relationship_type IN ('child', 'descendant')),

  -- Additional info
  birth_year INTEGER,
  proof_documents TEXT[],
  message TEXT, -- Why they think they're connected

  -- Review
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, member_id) -- Can't request same connection twice
);

CREATE INDEX idx_connection_requests_status ON connection_requests(status);
CREATE INDEX idx_connection_requests_user ON connection_requests(user_id);
```

### **4. Tree Access Control**

```sql
-- Tree collaborators (for both system and user trees)
CREATE TABLE tree_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID REFERENCES family_trees(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Permission levels
  permission TEXT NOT NULL CHECK (permission IN ('view', 'contribute', 'moderate', 'admin')),

  -- Metadata
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(tree_id, user_id)
);

COMMENT ON COLUMN tree_collaborators.permission IS '
  view = can only view the tree
  contribute = can submit additions (pending approval)
  moderate = can approve/reject contributions
  admin = full edit access
';

CREATE INDEX idx_tree_collaborators_tree ON tree_collaborators(tree_id);
CREATE INDEX idx_tree_collaborators_user ON tree_collaborators(user_id);
```

### **5. Activity Log (Audit Trail)**

```sql
CREATE TABLE tree_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID REFERENCES family_trees(id) ON DELETE CASCADE,

  -- What happened
  action TEXT NOT NULL CHECK (action IN (
    'member_added', 'member_updated', 'member_deleted',
    'relationship_added', 'relationship_deleted',
    'contribution_submitted', 'contribution_approved', 'contribution_rejected',
    'tree_updated'
  )),

  -- Who did it
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,

  -- Details
  entity_type TEXT, -- 'member', 'relationship', 'tree'
  entity_id UUID,
  changes JSONB, -- Before/after data

  -- When
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_tree ON tree_activity_log(tree_id);
CREATE INDEX idx_activity_log_user ON tree_activity_log(user_id);
CREATE INDEX idx_activity_log_created ON tree_activity_log(created_at);
```

---

## 🔒 **Row Level Security Policies**

### **1. Family Trees RLS**

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own trees" ON family_trees;
DROP POLICY IF EXISTS "Users can insert own trees" ON family_trees;
DROP POLICY IF EXISTS "Users can update own trees" ON family_trees;
DROP POLICY IF EXISTS "Users can delete own trees" ON family_trees;

-- NEW POLICIES

-- Anyone can view public/system trees
CREATE POLICY "Anyone can view public trees"
ON family_trees FOR SELECT
USING (
  is_public = TRUE
  OR tree_type = 'system'
  OR user_id = auth.uid()
  OR auth.uid() IN (SELECT user_id FROM tree_collaborators WHERE tree_id = id)
);

-- Users can create their own trees
CREATE POLICY "Users can create user trees"
ON family_trees FOR INSERT
WITH CHECK (
  tree_type = 'user'
  AND user_id = auth.uid()
);

-- Only admins can create system trees
CREATE POLICY "Admins can create system trees"
ON family_trees FOR INSERT
WITH CHECK (
  tree_type = 'system'
  AND is_moderator(auth.uid())
);

-- Users can update their own trees
CREATE POLICY "Users can update own trees"
ON family_trees FOR UPDATE
USING (
  (tree_type = 'user' AND user_id = auth.uid())
  OR can_edit_tree(id, auth.uid())
);

-- Users can delete only their own user trees (not system trees)
CREATE POLICY "Users can delete own user trees"
ON family_trees FOR DELETE
USING (
  tree_type = 'user'
  AND user_id = auth.uid()
);
```

### **2. Family Members RLS**

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view members" ON family_members;
DROP POLICY IF EXISTS "Users can insert members" ON family_members;

-- NEW POLICIES

-- Anyone can view members of public trees
CREATE POLICY "Anyone can view public tree members"
ON family_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM family_trees
    WHERE id = tree_id
    AND (
      is_public = TRUE
      OR tree_type = 'system'
      OR user_id = auth.uid()
      OR auth.uid() IN (SELECT user_id FROM tree_collaborators WHERE tree_id = family_trees.id)
    )
  )
);

-- Users can add members to their own trees
CREATE POLICY "Users can add members to own trees"
ON family_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM family_trees
    WHERE id = tree_id
    AND tree_type = 'user'
    AND user_id = auth.uid()
  )
);

-- Moderators can add members to system trees
CREATE POLICY "Moderators can add members to system trees"
ON family_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM family_trees
    WHERE id = tree_id
    AND tree_type = 'system'
    AND can_edit_tree(id, auth.uid())
  )
);

-- Users can update members in their own trees
CREATE POLICY "Users can update own tree members"
ON family_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM family_trees
    WHERE id = tree_id
    AND (
      (tree_type = 'user' AND user_id = auth.uid())
      OR can_edit_tree(id, auth.uid())
    )
  )
);

-- Similar for DELETE
CREATE POLICY "Users can delete own tree members"
ON family_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM family_trees
    WHERE id = tree_id
    AND (
      (tree_type = 'user' AND user_id = auth.uid())
      OR can_edit_tree(id, auth.uid())
    )
  )
);
```

### **3. Pending Members RLS**

```sql
-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
ON pending_members FOR SELECT
USING (submitted_by = auth.uid());

-- Moderators can view all pending submissions
CREATE POLICY "Moderators can view all pending"
ON pending_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM family_trees
    WHERE id = tree_id
    AND can_edit_tree(id, auth.uid())
  )
);

-- Users can submit contributions
CREATE POLICY "Users can submit contributions"
ON pending_members FOR INSERT
WITH CHECK (submitted_by = auth.uid());

-- Only moderators can update (approve/reject)
CREATE POLICY "Moderators can review submissions"
ON pending_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM family_trees
    WHERE id = tree_id
    AND can_edit_tree(id, auth.uid())
  )
);
```

---

## 🔄 **Workflow: User Contribution to System Tree**

### **Scenario 1: User Adds Their Children**

```
1. User views Naqvi Syed system tree
2. User finds their father in the tree
3. User clicks "I am a descendant" or "Add my children"
4. Form appears:
   - "I am [Name], child of [Father's Name]"
   - Add children's details (name, birth year, etc.)
   - Upload proof documents (optional but recommended)
   - Write a message to moderators
5. User submits → Goes to pending_members table
6. Moderators receive notification
7. Moderator reviews:
   - Checks documentation
   - Validates relationship
   - Approves or Rejects
8. If approved:
   - User record created in family_members
   - Children records created
   - Relationships established
   - User gets notification
   - Activity logged
```

### **Scenario 2: User Connects to System Tree**

```
1. User creates account
2. User browses Jaffri Syed tree
3. User finds their grandfather
4. User clicks "Connect to this tree"
5. Connection request form:
   - "I am [Name], descendant of [Grandfather]"
   - My lineage: [Grandfather] → [Father] → [Me]
   - Proof documents
   - Message
6. Submit → connection_requests table
7. Moderator reviews
8. If approved:
   - Missing ancestors added
   - User connected
   - User can now add their immediate family (pending approval)
```

---

## 🎯 **User Permissions Matrix**

| Action | Regular User | Tree Contributor | Tree Moderator | Admin |
|--------|--------------|------------------|----------------|-------|
| View system tree | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Submit contribution | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Edit system tree directly | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| Approve/reject contributions | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| Create system tree | ❌ No | ❌ No | ❌ No | ✅ Yes |
| Assign moderators | ❌ No | ❌ No | ❌ No | ✅ Yes |
| Create private trees | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Edit own private trees | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🖥️ **API Endpoints**

### **System Trees**

```typescript
// GET /api/system-trees
// List all system trees (Naqvi, Jaffri, Kazmi, etc.)
{
  data: [
    {
      id: 'uuid',
      name: 'Naqvi Syed Shajra',
      tree_type: 'system',
      is_public: true,
      member_count: 5420,
      last_updated: '2025-11-14'
    }
  ]
}

// GET /api/system-trees/:id/members
// Get all members (paginated for large trees)
{
  data: [...members],
  pagination: { page: 1, total: 5420 }
}

// GET /api/system-trees/:id/pending
// Get pending contributions (moderators only)
{
  data: [...pending_submissions]
}
```

### **Contributions**

```typescript
// POST /api/contributions/submit
{
  tree_id: 'system-tree-uuid',
  parent_id: 'existing-member-uuid',
  connection_type: 'child',
  members: [
    {
      name: 'My Name',
      gender: 'M',
      birth_year: 1990
    },
    {
      name: 'My Child',
      gender: 'F',
      birth_year: 2020
    }
  ],
  proof_documents: ['url1', 'url2'],
  message: 'I am the son of X, here is proof...'
}

// POST /api/contributions/:id/review
{
  status: 'approved', // or 'rejected'
  review_notes: 'Documentation verified, approved.'
}
```

### **Connection Requests**

```typescript
// POST /api/connection-requests
{
  tree_id: 'system-tree-uuid',
  member_id: 'ancestor-uuid',
  user_name: 'My Full Name',
  relationship_type: 'descendant',
  lineage: 'Ancestor → Grandfather → Father → Me',
  birth_year: 1990,
  proof_documents: ['url1'],
  message: 'I believe I am connected through...'
}

// POST /api/connection-requests/:id/review
{
  status: 'approved',
  review_notes: 'Verified through documents'
}
```

---

## 📱 **UI Components**

### **System Tree Viewer**

```vue
<!-- pages/system-trees/[id].vue -->
<template>
  <div class="system-tree-view">
    <!-- Banner indicating this is official tree -->
    <div class="official-banner">
      🌳 Official {{ treeName }} Shajra
      <badge>Verified & Moderated</badge>
    </div>

    <!-- Tree visualization (read-only) -->
    <ShajraChart :family-data="treeData" :readonly="true" />

    <!-- User actions -->
    <div class="user-actions" v-if="user">
      <button @click="showConnectModal">
        🔗 Connect to this tree
      </button>
      <button @click="showContributeModal" v-if="userIsConnected">
        ➕ Add my children
      </button>
    </div>

    <!-- Moderation panel (moderators only) -->
    <ModeratorPanel v-if="isModerator" :tree-id="treeId" />
  </div>
</template>
```

### **Contribution Form**

```vue
<!-- components/ContributionForm.vue -->
<template>
  <form @submit.prevent="submitContribution">
    <h3>Add Your Family to {{ parentName }}</h3>

    <!-- Connection point -->
    <div class="connection-info">
      I am a <select v-model="connectionType">
        <option value="child">Child</option>
        <option value="spouse">Spouse</option>
      </select> of <strong>{{ parentName }}</strong>
    </div>

    <!-- My info -->
    <input v-model="myInfo.name" placeholder="Your full name" required>
    <select v-model="myInfo.gender" required>
      <option value="M">Male</option>
      <option value="F">Female</option>
    </select>
    <input type="number" v-model="myInfo.birth_year" placeholder="Birth year">

    <!-- Children -->
    <div v-for="(child, i) in children" :key="i">
      <input v-model="child.name" placeholder="Child's name">
      <select v-model="child.gender">...</select>
      <input v-model="child.birth_year" placeholder="Birth year">
    </div>
    <button type="button" @click="addChild">+ Add Child</button>

    <!-- Proof documents -->
    <FileUpload
      v-model="proofDocuments"
      accept=".pdf,.jpg,.png"
      multiple
      label="Upload proof (optional but recommended)"
    />

    <!-- Message to moderators -->
    <textarea
      v-model="message"
      placeholder="Explain your connection and provide any additional context..."
    />

    <!-- Submit -->
    <button type="submit">Submit for Review</button>
    <p class="note">
      Your submission will be reviewed by moderators.
      You'll be notified once it's approved or if more information is needed.
    </p>
  </form>
</template>
```

### **Moderation Dashboard**

```vue
<!-- pages/moderate.vue -->
<template>
  <div class="moderation-dashboard">
    <h1>Pending Contributions</h1>

    <!-- Filters -->
    <div class="filters">
      <select v-model="filterTree">
        <option value="">All trees</option>
        <option v-for="tree in systemTrees" :value="tree.id">
          {{ tree.name }}
        </option>
      </select>
      <select v-model="sortBy">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>

    <!-- Pending list -->
    <div class="pending-list">
      <ContributionCard
        v-for="contribution in pendingContributions"
        :key="contribution.id"
        :contribution="contribution"
        @approve="handleApprove"
        @reject="handleReject"
      />
    </div>
  </div>
</template>
```

---

## 🚀 **Implementation Phases**

### **Phase 1: Core System Trees (Week 1-2)**
- [ ] Update database schema
- [ ] Add tree_type column
- [ ] Update RLS policies
- [ ] Create system tree viewer (read-only)
- [ ] Create initial system trees (Naqvi, Jaffri, Kazmi)

### **Phase 2: Contribution System (Week 3-4)**
- [ ] Pending members table
- [ ] Contribution submission form
- [ ] File upload for proof documents
- [ ] Basic moderation dashboard
- [ ] Approve/reject workflow

### **Phase 3: Connection Requests (Week 5-6)**
- [ ] Connection request table
- [ ] Connection request form
- [ ] Lineage visualization
- [ ] Moderator review interface

### **Phase 4: User Roles & Permissions (Week 7-8)**
- [ ] User roles table
- [ ] Admin panel for role management
- [ ] Moderator assignment interface
- [ ] Permission checks throughout app

### **Phase 5: Notifications & Activity (Week 9-10)**
- [ ] Email notifications (contribution status)
- [ ] In-app notifications
- [ ] Activity log
- [ ] Audit trail viewer

---

## 📊 **Example: Initial System Trees**

```sql
-- Insert initial system trees
INSERT INTO family_trees (id, name, description, tree_type, is_public, user_id, managed_by)
VALUES
  (
    gen_random_uuid(),
    'Naqvi Syed Shajra',
    'Complete lineage of Naqvi Syed families worldwide',
    'system',
    TRUE,
    NULL, -- System trees have no single owner
    ARRAY['admin-user-uuid']::UUID[] -- Admin is moderator
  ),
  (
    gen_random_uuid(),
    'Jaffri Syed Shajra',
    'Complete lineage of Jaffri Syed families worldwide',
    'system',
    TRUE,
    NULL,
    ARRAY['admin-user-uuid']::UUID[]
  ),
  (
    gen_random_uuid(),
    'Kazmi Syed Shajra',
    'Complete lineage of Kazmi Syed families worldwide',
    'system',
    TRUE,
    NULL,
    ARRAY['admin-user-uuid']::UUID[]
  );
```

---

## 🔐 **Security Considerations**

### **Preventing Abuse**

```sql
-- Rate limit: Max 5 contributions per user per day
CREATE TABLE contribution_rate_limit (
  user_id UUID REFERENCES auth.users(id),
  submission_date DATE DEFAULT CURRENT_DATE,
  submission_count INTEGER DEFAULT 1,
  PRIMARY KEY (user_id, submission_date)
);

-- Function to check rate limit
CREATE FUNCTION check_contribution_limit(user_uuid UUID) RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT submission_count < 5
     FROM contribution_rate_limit
     WHERE user_id = user_uuid
     AND submission_date = CURRENT_DATE),
    TRUE
  );
$$ LANGUAGE SQL;
```

### **Data Validation**

```typescript
// Server-side validation for contributions
function validateContribution(contribution: PendingMember) {
  // Name validation
  if (!contribution.name || contribution.name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters')
  }

  // Year validation
  if (contribution.birth_year) {
    const currentYear = new Date().getFullYear()
    if (contribution.birth_year < 1800 || contribution.birth_year > currentYear) {
      throw new Error('Invalid birth year')
    }
  }

  // Death year validation
  if (contribution.death_year && contribution.birth_year) {
    if (contribution.death_year < contribution.birth_year) {
      throw new Error('Death year cannot be before birth year')
    }
  }

  // Proof documents (if provided)
  if (contribution.proof_documents) {
    // Validate file types, sizes, etc.
  }
}
```

---

## 📈 **Scaling Considerations**

**For Large System Trees (10,000+ members):**
- Implement virtual scrolling
- Pagination for tree views
- Lazy loading of tree branches
- Caching strategies
- Database indexing on frequently queried columns

**For High Contribution Volume:**
- Batch approve/reject
- Auto-approval for trusted contributors
- ML-based fraud detection
- Duplicate detection algorithms

---

## 🎯 **Success Metrics**

**System Health:**
- Number of system trees
- Total members in system trees
- Moderator response time
- Contribution approval rate

**User Engagement:**
- Connection requests per month
- Contributions per month
- User retention after contribution
- Private trees created

**Quality Metrics:**
- Accuracy of lineage data
- Documentation provided (%)
- Disputes/corrections needed

---

*This architecture provides a robust foundation for a collaborative, moderated genealogy system similar to FamilySearch or Geni.com, but specialized for Sadaat/Syed families.*

**Last Updated:** 2025-11-14
**Status:** Architecture Complete - Ready for Implementation
