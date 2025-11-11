/**
 * POST /api/family-members
 * Creates a new family member in a tree
 */

import type { FamilyMember, FamilyMemberInput } from '~/types/database';

export default defineEventHandler(async (event) => {
  // Require user authentication
  const user = await requireUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - User not authenticated',
    });
  }

  const supabase = await serverSupabaseClient(event);

  try {
    // Parse request body
    const body = await readBody<FamilyMemberInput>(event);

    // Validate input
    if (!body.name || body.name.trim().length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Member name is required',
      });
    }

    if (!body.gender || !['M', 'F'].includes(body.gender)) {
      throw createError({
        statusCode: 400,
        message: 'Gender must be M or F',
      });
    }

    if (!body.tree_id) {
      throw createError({
        statusCode: 400,
        message: 'Tree ID is required',
      });
    }

    // Validate year logic
    if (body.birth_year && body.death_year && body.death_year < body.birth_year) {
      throw createError({
        statusCode: 400,
        message: 'Death year cannot be before birth year',
      });
    }

    // Verify the user owns the tree
    const { data: treeData, error: treeError } = await supabase
      .from('family_trees')
      .select('id')
      .eq('id', body.tree_id)
      .eq('user_id', user.user.id)
      .single();

    if (treeError || !treeData) {
      throw createError({
        statusCode: 403,
        message: 'Tree not found or access denied',
      });
    }

    // Create the family member
    const { data, error } = await supabase
      .from('family_members')
      .insert({
        tree_id: body.tree_id,
        name: body.name.trim(),
        gender: body.gender,
        birth_year: body.birth_year || null,
        death_year: body.death_year || null,
        img: body.img || null,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating family member:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to create family member',
        data: error,
      });
    }

    return {
      success: true,
      data: data as FamilyMember,
      message: 'Family member created successfully',
    };
  } catch (err: any) {
    console.error('Server error creating family member:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Internal server error',
    });
  }
});
