-- Sample Data for Testing Shajra Application
-- This file contains sample family tree data that can be used for testing
--
-- IMPORTANT: Run this AFTER the main migration (001_initial_schema.sql)
-- and AFTER you have created at least one user account
--
-- To use this file:
-- 1. Sign up a user in your application
-- 2. Get your user ID from auth.users table
-- 3. Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- 4. Run this SQL in Supabase SQL Editor

-- =============================================================================
-- CONFIGURATION
-- =============================================================================
-- Replace this with your actual user ID from auth.users
-- You can find it in: Supabase Dashboard → Authentication → Users
DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_ID_HERE'::uuid; -- CHANGE THIS!
  v_tree_id UUID;
  v_grandfather_id UUID;
  v_grandmother_id UUID;
  v_father_id UUID;
  v_mother_id UUID;
  v_uncle_id UUID;
  v_aunt_id UUID;
  v_me_id UUID;
  v_brother_id UUID;
  v_sister_id UUID;
  v_spouse_id UUID;
  v_child1_id UUID;
  v_child2_id UUID;
BEGIN
  -- =============================================================================
  -- CREATE FAMILY TREE
  -- =============================================================================
  INSERT INTO public.family_trees (user_id, name, description, is_default)
  VALUES (
    v_user_id,
    'Sample Family Tree',
    'A sample three-generation family tree for testing',
    true
  )
  RETURNING id INTO v_tree_id;

  RAISE NOTICE 'Created family tree with ID: %', v_tree_id;

  -- =============================================================================
  -- GENERATION 1: GRANDPARENTS
  -- =============================================================================

  -- Grandfather (paternal)
  INSERT INTO public.family_members (tree_id, name, gender, birth_year, death_year, notes)
  VALUES (
    v_tree_id,
    'William Anderson',
    'M',
    1935,
    2010,
    'Paternal grandfather, served in the military'
  )
  RETURNING id INTO v_grandfather_id;

  -- Grandmother (paternal)
  INSERT INTO public.family_members (tree_id, name, gender, birth_year, notes)
  VALUES (
    v_tree_id,
    'Margaret Anderson',
    'F',
    1938,
    'Paternal grandmother, retired teacher'
  )
  RETURNING id INTO v_grandmother_id;

  -- =============================================================================
  -- GENERATION 2: PARENTS AND AUNT/UNCLE
  -- =============================================================================

  -- Father
  INSERT INTO public.family_members (tree_id, name, gender, birth_year, notes)
  VALUES (
    v_tree_id,
    'Robert Anderson',
    'M',
    1960,
    'Father, civil engineer'
  )
  RETURNING id INTO v_father_id;

  -- Mother
  INSERT INTO public.family_members (tree_id, name, gender, birth_year, notes)
  VALUES (
    v_tree_id,
    'Susan Anderson',
    'F',
    1962,
    'Mother, doctor'
  )
  RETURNING id INTO v_mother_id;

  -- Uncle (father''s brother)
  INSERT INTO public.family_members (tree_id, name, gender, birth_year, notes)
  VALUES (
    v_tree_id,
    'James Anderson',
    'M',
    1965,
    'Uncle, business owner'
  )
  RETURNING id INTO v_uncle_id;

  -- Aunt (married to uncle)
  INSERT INTO public.family_members (tree_id, name, gender, birth_year, notes)
  VALUES (
    v_tree_id,
    'Emily Anderson',
    'F',
    1967,
    'Aunt, artist'
  )
  RETURNING id INTO v_aunt_id;

  -- =============================================================================
  -- GENERATION 3: YOU AND SIBLINGS
  -- =============================================================================

  -- You (replace with your actual name if desired)
  INSERT INTO public.family_members (tree_id, name, gender, birth_year, notes)
  VALUES (
    v_tree_id,
    'John Anderson',
    'M',
    1990,
    'Me - software developer'
  )
  RETURNING id INTO v_me_id;

  -- Brother
  INSERT INTO public.family_members (tree_id, name, gender, birth_year, notes)
  VALUES (
    v_tree_id,
    'Michael Anderson',
    'M',
    1992,
    'Brother, architect'
  )
  RETURNING id INTO v_brother_id;

  -- Sister
  INSERT INTO public.family_members (tree_id, name, gender, birth_year, notes)
  VALUES (
    v_tree_id,
    'Sarah Anderson',
    'F',
    1995,
    'Sister, teacher'
  )
  RETURNING id INTO v_sister_id;

  -- Your spouse
  INSERT INTO public.family_members (tree_id, name, gender, birth_year, notes)
  VALUES (
    v_tree_id,
    'Emma Anderson',
    'F',
    1991,
    'My spouse, designer'
  )
  RETURNING id INTO v_spouse_id;

  -- =============================================================================
  -- GENERATION 4: YOUR CHILDREN
  -- =============================================================================

  -- Child 1
  INSERT INTO public.family_members (tree_id, name, gender, birth_year, notes)
  VALUES (
    v_tree_id,
    'Oliver Anderson',
    'M',
    2018,
    'My son'
  )
  RETURNING id INTO v_child1_id;

  -- Child 2
  INSERT INTO public.family_members (tree_id, name, gender, birth_year, notes)
  VALUES (
    v_tree_id,
    'Sophia Anderson',
    'F',
    2020,
    'My daughter'
  )
  RETURNING id INTO v_child2_id;

  -- =============================================================================
  -- RELATIONSHIPS
  -- =============================================================================

  -- Grandparents are spouses
  INSERT INTO public.relationships (tree_id, member_id, related_member_id, relationship_type)
  VALUES (v_tree_id, v_grandfather_id, v_grandmother_id, 'spouse');

  -- Father's parents
  INSERT INTO public.relationships (tree_id, member_id, related_member_id, relationship_type)
  VALUES
    (v_tree_id, v_grandfather_id, v_father_id, 'parent'),
    (v_tree_id, v_grandmother_id, v_father_id, 'parent');

  -- Uncle's parents
  INSERT INTO public.relationships (tree_id, member_id, related_member_id, relationship_type)
  VALUES
    (v_tree_id, v_grandfather_id, v_uncle_id, 'parent'),
    (v_tree_id, v_grandmother_id, v_uncle_id, 'parent');

  -- Father and Mother are spouses
  INSERT INTO public.relationships (tree_id, member_id, related_member_id, relationship_type)
  VALUES (v_tree_id, v_father_id, v_mother_id, 'spouse');

  -- Uncle and Aunt are spouses
  INSERT INTO public.relationships (tree_id, member_id, related_member_id, relationship_type)
  VALUES (v_tree_id, v_uncle_id, v_aunt_id, 'spouse');

  -- Your parents
  INSERT INTO public.relationships (tree_id, member_id, related_member_id, relationship_type)
  VALUES
    (v_tree_id, v_father_id, v_me_id, 'parent'),
    (v_tree_id, v_mother_id, v_me_id, 'parent');

  -- Brother's parents
  INSERT INTO public.relationships (tree_id, member_id, related_member_id, relationship_type)
  VALUES
    (v_tree_id, v_father_id, v_brother_id, 'parent'),
    (v_tree_id, v_mother_id, v_brother_id, 'parent');

  -- Sister's parents
  INSERT INTO public.relationships (tree_id, member_id, related_member_id, relationship_type)
  VALUES
    (v_tree_id, v_father_id, v_sister_id, 'parent'),
    (v_tree_id, v_mother_id, v_sister_id, 'parent');

  -- You and your spouse
  INSERT INTO public.relationships (tree_id, member_id, related_member_id, relationship_type)
  VALUES (v_tree_id, v_me_id, v_spouse_id, 'spouse');

  -- Your children's parents
  INSERT INTO public.relationships (tree_id, member_id, related_member_id, relationship_type)
  VALUES
    (v_tree_id, v_me_id, v_child1_id, 'parent'),
    (v_tree_id, v_spouse_id, v_child1_id, 'parent'),
    (v_tree_id, v_me_id, v_child2_id, 'parent'),
    (v_tree_id, v_spouse_id, v_child2_id, 'parent');

  -- =============================================================================
  -- SUMMARY
  -- =============================================================================
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Sample data created successfully!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Tree ID: %', v_tree_id;
  RAISE NOTICE 'Total members: 13';
  RAISE NOTICE 'Total relationships: 19';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Family Structure:';
  RAISE NOTICE '  Generation 1: % & %', 'William', 'Margaret';
  RAISE NOTICE '  Generation 2: % & % (+ % & %)', 'Robert', 'Susan', 'James', 'Emily';
  RAISE NOTICE '  Generation 3: %, %, % (+ spouse %)', 'John', 'Michael', 'Sarah', 'Emma';
  RAISE NOTICE '  Generation 4: % & %', 'Oliver', 'Sophia';
  RAISE NOTICE '============================================';

END $$;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Uncomment to verify the data was created correctly

-- Check all members
-- SELECT name, gender, birth_year, death_year, notes
-- FROM public.family_members
-- WHERE tree_id IN (SELECT id FROM public.family_trees WHERE name = 'Sample Family Tree')
-- ORDER BY birth_year NULLS LAST;

-- Check all relationships
-- SELECT
--   fm1.name as member_name,
--   r.relationship_type,
--   fm2.name as related_to
-- FROM public.relationships r
-- JOIN public.family_members fm1 ON r.member_id = fm1.id
-- JOIN public.family_members fm2 ON r.related_member_id = fm2.id
-- WHERE r.tree_id IN (SELECT id FROM public.family_trees WHERE name = 'Sample Family Tree')
-- ORDER BY fm1.birth_year, fm2.birth_year;

-- Count members by generation (approximate)
-- SELECT
--   CASE
--     WHEN birth_year < 1950 THEN 'Generation 1 (Before 1950)'
--     WHEN birth_year BETWEEN 1950 AND 1980 THEN 'Generation 2 (1950-1980)'
--     WHEN birth_year BETWEEN 1981 AND 2000 THEN 'Generation 3 (1981-2000)'
--     ELSE 'Generation 4 (After 2000)'
--   END as generation,
--   COUNT(*) as member_count
-- FROM public.family_members
-- WHERE tree_id IN (SELECT id FROM public.family_trees WHERE name = 'Sample Family Tree')
-- GROUP BY generation
-- ORDER BY MIN(birth_year);

-- =============================================================================
-- NOTES
-- =============================================================================
-- This sample data creates a realistic family tree with:
-- - 4 generations
-- - 13 family members
-- - 19 relationships (parent, spouse, child)
-- - Birth/death years
-- - Descriptive notes
--
-- The data includes:
-- - Grandparents (with one deceased)
-- - Parents and aunt/uncle
-- - Siblings
-- - Spouse
-- - Children
--
-- You can modify the names, years, and relationships to match your needs
-- or use this as a template to create your own sample data.
