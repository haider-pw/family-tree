-- Shajra Family Tree Application - Initial Database Schema
-- This migration creates the core tables and security policies for the family tree application

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Extends auth.users with additional user metadata
-- One-to-one relationship with auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- FAMILY_TREES TABLE
-- ============================================================================
-- Stores information about family trees
-- Each user can have multiple family trees
CREATE TABLE IF NOT EXISTS public.family_trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraint to ensure tree name is not empty
  CONSTRAINT family_trees_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS family_trees_user_id_idx ON public.family_trees(user_id);
CREATE INDEX IF NOT EXISTS family_trees_user_id_is_default_idx ON public.family_trees(user_id, is_default);

-- Enable Row Level Security
ALTER TABLE public.family_trees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_trees table
-- Users can view their own family trees
CREATE POLICY "Users can view own family trees"
  ON public.family_trees
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own family trees
CREATE POLICY "Users can insert own family trees"
  ON public.family_trees
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own family trees
CREATE POLICY "Users can update own family trees"
  ON public.family_trees
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own family trees
CREATE POLICY "Users can delete own family trees"
  ON public.family_trees
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FAMILY_MEMBERS TABLE
-- ============================================================================
-- Stores information about individual family members in a tree
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES public.family_trees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_year INTEGER,
  death_year INTEGER,
  img TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT family_members_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT family_members_gender_valid CHECK (gender IN ('M', 'F')),
  CONSTRAINT family_members_years_valid CHECK (
    (birth_year IS NULL OR birth_year >= 0) AND
    (death_year IS NULL OR death_year >= 0) AND
    (birth_year IS NULL OR death_year IS NULL OR death_year >= birth_year)
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS family_members_tree_id_idx ON public.family_members(tree_id);
CREATE INDEX IF NOT EXISTS family_members_tree_id_gender_idx ON public.family_members(tree_id, gender);

-- Enable Row Level Security
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_members table
-- Users can view family members in their own trees
CREATE POLICY "Users can view family members in own trees"
  ON public.family_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_trees
      WHERE family_trees.id = family_members.tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

-- Users can insert family members in their own trees
CREATE POLICY "Users can insert family members in own trees"
  ON public.family_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_trees
      WHERE family_trees.id = family_members.tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

-- Users can update family members in their own trees
CREATE POLICY "Users can update family members in own trees"
  ON public.family_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.family_trees
      WHERE family_trees.id = family_members.tree_id
      AND family_trees.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_trees
      WHERE family_trees.id = family_members.tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

-- Users can delete family members in their own trees
CREATE POLICY "Users can delete family members in own trees"
  ON public.family_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.family_trees
      WHERE family_trees.id = family_members.tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RELATIONSHIPS TABLE
-- ============================================================================
-- Stores relationships between family members
-- Note: Relationships are stored once but represent bidirectional connections
CREATE TABLE IF NOT EXISTS public.relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES public.family_trees(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  related_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT relationships_type_valid CHECK (relationship_type IN ('spouse', 'parent', 'child')),
  CONSTRAINT relationships_not_self CHECK (member_id != related_member_id),

  -- Unique constraint to prevent duplicate relationships
  CONSTRAINT relationships_unique UNIQUE (member_id, related_member_id, relationship_type)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS relationships_tree_id_idx ON public.relationships(tree_id);
CREATE INDEX IF NOT EXISTS relationships_member_id_idx ON public.relationships(member_id);
CREATE INDEX IF NOT EXISTS relationships_related_member_id_idx ON public.relationships(related_member_id);
CREATE INDEX IF NOT EXISTS relationships_tree_member_idx ON public.relationships(tree_id, member_id);

-- Enable Row Level Security
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for relationships table
-- Users can view relationships in their own trees
CREATE POLICY "Users can view relationships in own trees"
  ON public.relationships
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_trees
      WHERE family_trees.id = relationships.tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

-- Users can insert relationships in their own trees
CREATE POLICY "Users can insert relationships in own trees"
  ON public.relationships
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_trees
      WHERE family_trees.id = relationships.tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

-- Users can update relationships in their own trees
CREATE POLICY "Users can update relationships in own trees"
  ON public.relationships
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.family_trees
      WHERE family_trees.id = relationships.tree_id
      AND family_trees.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_trees
      WHERE family_trees.id = relationships.tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

-- Users can delete relationships in their own trees
CREATE POLICY "Users can delete relationships in own trees"
  ON public.relationships
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.family_trees
      WHERE family_trees.id = relationships.tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for family_trees table
CREATE TRIGGER update_family_trees_updated_at
  BEFORE UPDATE ON public.family_trees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for family_members table
CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to ensure only one default tree per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_tree()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    -- Set all other trees for this user to non-default
    UPDATE public.family_trees
    SET is_default = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain single default tree
CREATE TRIGGER maintain_single_default_tree
  BEFORE INSERT OR UPDATE ON public.family_trees
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION public.ensure_single_default_tree();

-- ============================================================================
-- HELPER VIEWS (Optional but useful)
-- ============================================================================

-- View to get complete family member information with tree ownership
CREATE OR REPLACE VIEW public.family_members_with_tree AS
SELECT
  fm.*,
  ft.user_id,
  ft.name as tree_name
FROM public.family_members fm
JOIN public.family_trees ft ON fm.tree_id = ft.id;

-- Grant access to authenticated users
GRANT SELECT ON public.family_members_with_tree TO authenticated;

-- ============================================================================
-- SAMPLE DATA FOR TESTING (Optional - comment out in production)
-- ============================================================================
-- This section can be used to create sample data for testing purposes
-- Uncomment to use during development

/*
-- Create a sample user profile (assuming user already exists in auth.users)
-- INSERT INTO public.profiles (id, full_name)
-- VALUES ('sample-user-uuid', 'Test User');

-- Create a sample family tree
-- INSERT INTO public.family_trees (user_id, name, description, is_default)
-- VALUES ('sample-user-uuid', 'My Family Tree', 'Our family lineage', true)
-- RETURNING id;
*/

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'User profile information extending auth.users';
COMMENT ON TABLE public.family_trees IS 'Family tree collections owned by users';
COMMENT ON TABLE public.family_members IS 'Individual family members within trees';
COMMENT ON TABLE public.relationships IS 'Relationships between family members (spouse, parent, child)';

COMMENT ON COLUMN public.family_members.gender IS 'Gender: M (Male) or F (Female)';
COMMENT ON COLUMN public.family_members.birth_year IS 'Year of birth (optional)';
COMMENT ON COLUMN public.family_members.death_year IS 'Year of death (optional)';
COMMENT ON COLUMN public.family_members.img IS 'URL to profile image';
COMMENT ON COLUMN public.family_trees.is_default IS 'Indicates if this is the user''s default tree (only one per user)';
COMMENT ON COLUMN public.relationships.relationship_type IS 'Type of relationship: spouse, parent, or child';
