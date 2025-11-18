# Shajra Project - Detailed Roadmap & Planning

## Current State Analysis

### ✅ **Completed (Production Ready)**

**Core Infrastructure:**
- ✅ Nuxt 3 + Vue 3 + TypeScript setup
- ✅ Supabase integration (Auth + Database)
- ✅ Complete authentication system with session persistence
- ✅ SSR-compatible authentication middleware
- ✅ Database schema with RLS policies
- ✅ API endpoints for all CRUD operations
- ✅ Pinia state management
- ✅ Dark mode with persistence
- ✅ Responsive UI (mobile/tablet/desktop)

**Functionality:**
- ✅ User signup/login/logout
- ✅ Multiple family trees per user
- ✅ Family members CRUD
- ✅ Relationship management (parent/child/spouse)
- ✅ Data transformation for visualization
- ✅ family-chart library integration

**Quality:**
- ✅ Type safety throughout
- ✅ Row Level Security
- ✅ Input validation
- ✅ Error handling
- ✅ Loading states

---

## 🚧 **Critical Missing Features (Blocking MVP)**

### 1. **Tree Builder UI** ⚠️ CRITICAL
**Status:** Missing - App is unusable without this!

**What's Needed:**
- [ ] Create Tree button/form in main view
- [ ] Add Member button/form
- [ ] Edit Member modal
- [ ] Delete confirmation dialogs
- [ ] Relationship builder UI

**Why Critical:** Users currently see empty state but can't add data!

**Estimated Effort:** 2-3 days

---

### 2. **Member Management Interface**
**Components Needed:**
```
components/
├── TreeManager.vue          # Tree CRUD interface
├── MemberForm.vue           # Add/Edit member form
├── MemberCard.vue           # Member display card
├── RelationshipBuilder.vue  # Visual relationship creator
└── ConfirmDialog.vue        # Reusable confirmation
```

**User Stories:**
1. As a user, I want to create a new family tree
2. As a user, I want to add family members with details
3. As a user, I want to define relationships between members
4. As a user, I want to edit member information
5. As a user, I want to delete members
6. As a user, I want to switch between my trees

---

## 📋 **Feature Prioritization**

### **Phase 1: MVP Completion** (Week 1-2)
**Goal:** Make the app fully functional

#### Priority 1.1 - Tree Management UI
- [ ] Create tree button and form
- [ ] Tree selector dropdown
- [ ] Edit tree name/description
- [ ] Delete tree with confirmation
- [ ] Set default tree toggle

**Implementation:**
```vue
<!-- TreeSelector.vue -->
<template>
  <div class="tree-selector">
    <select v-model="activeTreeId">
      <option v-for="tree in trees" :value="tree.id">
        {{ tree.name }}
      </option>
    </select>
    <button @click="showCreateForm">+ New Tree</button>
  </div>
</template>
```

#### Priority 1.2 - Member Management UI
- [ ] Add member floating action button
- [ ] Member form with validation
  - Name (required)
  - Gender (M/F dropdown)
  - Birth year (optional)
  - Death year (optional)
  - Photo URL (optional for now)
  - Notes (textarea)
- [ ] Member cards in tree view
- [ ] Edit member modal
- [ ] Delete member confirmation

#### Priority 1.3 - Relationship Builder
- [ ] Simple relationship form
  - Select member A
  - Select relationship type (parent/child/spouse)
  - Select member B
- [ ] Visual relationship indicators
- [ ] Validate relationship logic

---

### **Phase 2: Enhanced UX** (Week 3-4)

#### Priority 2.1 - Visual Improvements
- [ ] Better tree visualization controls
  - Zoom in/out buttons
  - Pan controls
  - Reset view button
- [ ] Member node interactions
  - Click to view details
  - Hover for quick info
  - Double-click to edit
- [ ] Relationship lines styling
  - Color-coded by type
  - Animated hover effects

#### Priority 2.2 - Photo Management
- [ ] Supabase Storage bucket setup
- [ ] Photo upload component
  - Drag & drop
  - File picker
  - Image preview
  - Size validation (max 2MB)
  - Format validation (JPG/PNG)
- [ ] Photo cropper
- [ ] Display photos in tree nodes
- [ ] Default avatar images

#### Priority 2.3 - Search & Filter
- [ ] Search members by name
- [ ] Filter by:
  - Gender
  - Birth year range
  - Living/Deceased
- [ ] Highlight search results in tree
- [ ] Jump to member in tree

---

### **Phase 3: Advanced Features** (Week 5-8)

#### Priority 3.1 - Data Import/Export
- [ ] GEDCOM import
  - Parse GEDCOM files
  - Map to database schema
  - Preview before import
  - Conflict resolution
- [ ] GEDCOM export
- [ ] CSV export
- [ ] PDF export (printable tree)
- [ ] PNG export (image)

#### Priority 3.2 - Rich Content
- [ ] Rich text editor for notes
  - Bold, italic, underline
  - Lists
  - Links
- [ ] Timeline view
  - Birth/death events
  - Marriages
  - Other life events
- [ ] Document attachments
  - Birth certificates
  - Marriage certificates
  - Photos
  - Documents

#### Priority 3.3 - Collaboration
- [ ] Share tree (read-only link)
- [ ] Invite collaborators
  - View permission
  - Edit permission
  - Admin permission
- [ ] Real-time collaboration
  - Show who's online
  - Live cursors
  - Change notifications
- [ ] Activity log
  - Who added what
  - When changes were made
  - Revert changes

---

### **Phase 4: Polish & Optimization** (Week 9-10)

#### Priority 4.1 - Performance
- [ ] Virtual scrolling for large trees
- [ ] Lazy loading of tree sections
- [ ] Image optimization
- [ ] Caching strategies
- [ ] Bundle size optimization

#### Priority 4.2 - Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] ARIA labels
- [ ] Focus management
- [ ] High contrast mode

#### Priority 4.3 - Testing
- [ ] Unit tests (Vitest)
  - Component tests
  - Store tests
  - API tests
- [ ] E2E tests (Playwright)
  - Authentication flow
  - Tree creation
  - Member management
- [ ] Visual regression tests

#### Priority 4.4 - Documentation
- [ ] User guide
- [ ] Video tutorials
- [ ] API documentation
- [ ] Contributing guide
- [ ] Changelog

---

## 🎯 **Feature Deep Dive**

### **1. Tree Builder UI (Detailed Spec)**

**User Flow:**
```
1. User logs in → Sees empty state or existing trees
2. Clicks "Create Tree" button
3. Form appears:
   - Tree name (required)
   - Description (optional)
   - Set as default (checkbox)
4. Submits → Tree created
5. Tree selector shows new tree
6. User clicks "Add Member"
7. Member form appears:
   - Name, gender, years, photo, notes
8. Member added to tree
9. User clicks "Add Relationship"
10. Relationship form:
    - Select member 1
    - Select type
    - Select member 2
11. Tree visualization updates
```

**Component Hierarchy:**
```
pages/index.vue
├── TreeSelector.vue
│   ├── TreeDropdown.vue
│   └── CreateTreeButton.vue
├── TreeControls.vue
│   ├── AddMemberButton.vue
│   ├── ZoomControls.vue
│   └── ViewOptions.vue
├── ShajraChart.vue (existing)
│   └── MemberNode.vue
│       ├── MemberAvatar.vue
│       └── MemberInfo.vue
└── Modals
    ├── MemberFormModal.vue
    ├── RelationshipFormModal.vue
    ├── TreeFormModal.vue
    └── ConfirmDeleteModal.vue
```

---

### **2. Photo Upload System**

**Architecture:**
```
Client (Vue)
  ↓ Upload photo
Supabase Storage
  ↓ Generate URL
Database (profiles/members)
  ↓ Store URL
Display in UI
```

**Storage Structure:**
```
shajra-photos/
├── avatars/
│   └── {user_id}/
│       └── {timestamp}_{filename}
└── members/
    └── {tree_id}/
        └── {member_id}/
            └── {timestamp}_{filename}
```

**RLS Policies:**
```sql
-- Users can only upload to their own folders
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
TO authenticated
USING (bucket_id = 'shajra-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can view their own photos
CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'shajra-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

### **3. GEDCOM Import/Export**

**GEDCOM Format (Sample):**
```gedcom
0 HEAD
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I1@ INDI
1 NAME John /Doe/
1 SEX M
1 BIRT
2 DATE 1 JAN 1950
1 FAMS @F1@
0 @I2@ INDI
1 NAME Jane /Smith/
1 SEX F
1 FAMS @F1@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I3@
```

**Parser Implementation:**
```typescript
// composables/useGedcomParser.ts
export function useGedcomParser() {
  function parseGedcom(content: string) {
    const lines = content.split('\n')
    const individuals = []
    const families = []

    // Parse GEDCOM structure
    // Map to our schema
    // Return preview data

    return { individuals, families }
  }

  async function importGedcom(treeId: string, data: ParsedGedcom) {
    // Create members
    // Create relationships
    // Handle duplicates
  }

  return { parseGedcom, importGedcom }
}
```

---

### **4. Collaboration Features**

**Share Link:**
```typescript
// Generate shareable link
POST /api/family-trees/:id/share
Response: {
  shareToken: 'abc123',
  shareUrl: 'https://shajra.app/shared/abc123',
  expiresAt: '2025-12-31',
  permissions: 'read'
}
```

**Permissions Model:**
```typescript
enum Permission {
  VIEW = 'view',    // Can only view
  EDIT = 'edit',    // Can add/edit members
  ADMIN = 'admin'   // Can delete, manage permissions
}

interface TreeCollaborator {
  id: string
  tree_id: string
  user_id: string
  permission: Permission
  invited_by: string
  invited_at: string
}
```

**Database Schema:**
```sql
CREATE TABLE tree_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID REFERENCES family_trees(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT CHECK (permission IN ('view', 'edit', 'admin')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tree_id, user_id)
);

CREATE TABLE tree_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID REFERENCES family_trees(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  permission TEXT CHECK (permission IN ('view', 'edit')),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 **Technical Improvements**

### **1. Email Verification**
```typescript
// Already supported by Supabase - just enable in dashboard
// Update signup flow to show verification message
```

### **2. Password Reset**
```vue
<!-- pages/forgot-password.vue -->
<template>
  <form @submit.prevent="handleReset">
    <input v-model="email" type="email" required>
    <button type="submit">Send Reset Link</button>
  </form>
</template>

<script setup>
const handleReset = async () => {
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: 'https://yourapp.com/reset-password'
  })
}
</script>
```

### **3. Performance Monitoring**
- [ ] Add Sentry for error tracking
- [ ] Add analytics (privacy-friendly)
- [ ] Monitor API response times
- [ ] Track bundle sizes
- [ ] Lighthouse CI

---

## 📊 **Metrics & KPIs**

**Success Metrics:**
- User signup rate
- Trees created per user
- Members added per tree
- Session duration
- Return user rate

**Technical Metrics:**
- Page load time < 2s
- API response time < 200ms
- Lighthouse score > 90
- Zero runtime errors
- 100% type coverage

---

## 🚀 **Deployment Strategy**

### **Staging Environment**
- Vercel preview deployments
- Separate Supabase project
- Test data only

### **Production Environment**
- Vercel production
- Custom domain
- Supabase production project
- Automated backups

### **CI/CD Pipeline**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    - yarn install
    - yarn typecheck
    - yarn lint
    - yarn test
  deploy-preview:
    - vercel deploy --preview
```

---

## 💰 **Cost Estimation**

**Supabase (Free Tier Limits):**
- 500MB database storage ✅
- 1GB file storage ✅
- 50,000 monthly active users ✅
- 2GB bandwidth ✅

**Vercel (Hobby Tier):**
- Unlimited deployments ✅
- 100GB bandwidth ✅
- Serverless functions ✅

**Total Monthly Cost:** $0 for MVP
**Upgrade Path:** ~$25/mo for Supabase Pro + Vercel Pro when scaling

---

## 📱 **Mobile Strategy**

**Progressive Web App (PWA):**
- [ ] Add manifest.json
- [ ] Service worker for offline
- [ ] Install prompt
- [ ] iOS splash screens
- [ ] App icons

**Responsive Design:**
- ✅ Mobile-first CSS
- ✅ Touch-friendly buttons
- ✅ Bottom sheet modals
- [ ] Swipe gestures
- [ ] Mobile-optimized charts

---

## 🎨 **Design System**

**Colors (Already Defined):**
```css
--heritage-green: #2d5016
--heritage-teal: #0d9488
--heritage-gold: #d97706
--parchment: #faf8f3
--forest-dark: #1a1a1a
```

**Typography:**
- Headings: Serif font (elegant)
- Body: Sans-serif (readable)
- Monospace: Code/data

**Components Library:**
- Buttons (primary, secondary, danger)
- Forms (input, select, textarea)
- Modals (small, medium, large)
- Cards (member, tree, info)
- Alerts (success, error, warning, info)

---

## 🔐 **Security Enhancements**

### **Current Security:**
- ✅ Row Level Security
- ✅ JWT authentication
- ✅ Input validation
- ✅ SQL injection protection
- ✅ XSS prevention

### **Additional Security:**
- [ ] Rate limiting (10 req/sec per user)
- [ ] CAPTCHA on signup
- [ ] Session timeout (30 days with refresh)
- [ ] Two-factor authentication (optional)
- [ ] Audit logs
- [ ] CSP headers
- [ ] CORS configuration

---

## 📈 **Scaling Considerations**

**Current Capacity:**
- Users: ~50,000 MAU (Supabase free tier)
- Trees per user: Unlimited
- Members per tree: ~1,000 (UI performance limit)

**Optimization for Large Trees:**
```typescript
// Virtual rendering for 1000+ members
import { useVirtualList } from '@vueuse/core'

// Paginated queries
const { data } = await supabase
  .from('family_members')
  .select('*')
  .range(0, 99) // Load 100 at a time
```

---

## 🎓 **Learning Resources**

**For Contributors:**
- Nuxt 3 docs: https://nuxt.com
- Vue 3 docs: https://vuejs.org
- Supabase docs: https://supabase.com/docs
- family-chart: https://github.com/SanichKotikov/relatives-tree
- TypeScript handbook: https://typescriptlang.org

---

## 🏁 **Next Immediate Actions**

### **This Week (Priority 1):**
1. Create TreeManager component
2. Create MemberForm component
3. Add "Create Tree" button to index.vue
4. Add "Add Member" button to index.vue
5. Wire up forms to Pinia store
6. Test end-to-end user flow

**Acceptance Criteria:**
- [ ] User can create a tree
- [ ] User can add members to tree
- [ ] Members appear in visualization
- [ ] User can edit member details
- [ ] User can delete members

---

*This roadmap is a living document and will be updated as the project evolves.*

**Last Updated:** 2025-11-14
**Version:** 1.0
**Status:** Planning Complete - Ready for Phase 1 Implementation
