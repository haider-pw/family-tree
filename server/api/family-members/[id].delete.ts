/**
 * DELETE /api/family-members/:id
 * Deletes a specific family member and all their relationships (cascade)
 */

import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  // Require user authentication
  const user = await serverSupabaseUser(event);

  if (!user || !user.sub) {
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
      .eq('user_id', user.sub)
      .single();

    if (treeError || !treeData) {
      throw createError({
        statusCode: 403,
        message: 'Access denied',
      });
    }

    // Delete the member (cascade will delete relationships)
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error deleting family member:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to delete family member',
        data: error,
      });
    }

    return {
      success: true,
      message: 'Family member deleted successfully',
    };
  } catch (err: any) {
    console.error('Server error deleting family member:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Internal server error',
    });
  }
});
