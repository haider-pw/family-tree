/**
 * PATCH /api/family-members/:id
 * Updates a specific family member
 */

import type { FamilyMember, FamilyMemberUpdate } from '~/types/database';

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
    // Get member ID from route params
    const memberId = getRouterParam(event, 'id');

    if (!memberId) {
      throw createError({
        statusCode: 400,
        message: 'Member ID is required',
      });
    }

    // Parse request body
    const body = await readBody<FamilyMemberUpdate>(event);

    // Validate input
    if (body.name !== undefined && body.name.trim().length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Member name cannot be empty',
      });
    }

    if (body.gender !== undefined && !['M', 'F'].includes(body.gender)) {
      throw createError({
        statusCode: 400,
        message: 'Gender must be M or F',
      });
    }

    // Verify the user owns the tree this member belongs to
    const { data: memberData, error: memberError } = await supabase
      .from('family_members')
      .select('tree_id')
      .eq('id', memberId)
      .single();

    if (memberError || !memberData) {
      throw createError({
        statusCode: 404,
        message: 'Family member not found',
      });
    }

    const { data: treeData, error: treeError } = await supabase
      .from('family_trees')
      .select('id')
      .eq('id', memberData.tree_id)
      .eq('user_id', user.user.id)
      .single();

    if (treeError || !treeData) {
      throw createError({
        statusCode: 403,
        message: 'Access denied',
      });
    }

    // Build update object
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.birth_year !== undefined) updateData.birth_year = body.birth_year;
    if (body.death_year !== undefined) updateData.death_year = body.death_year;
    if (body.img !== undefined) updateData.img = body.img;
    if (body.notes !== undefined) updateData.notes = body.notes;

    // Update the member
    const { data, error } = await supabase
      .from('family_members')
      .update(updateData)
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      console.error('Error updating family member:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to update family member',
        data: error,
      });
    }

    return {
      success: true,
      data: data as FamilyMember,
      message: 'Family member updated successfully',
    };
  } catch (err: any) {
    console.error('Server error updating family member:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Internal server error',
    });
  }
});
