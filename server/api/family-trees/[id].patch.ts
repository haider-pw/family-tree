/**
 * PATCH /api/family-trees/:id
 * Updates a specific family tree
 */

import type { FamilyTree, FamilyTreeUpdate } from '~/types/database';

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
    // Get tree ID from route params
    const treeId = getRouterParam(event, 'id');

    if (!treeId) {
      throw createError({
        statusCode: 400,
        message: 'Tree ID is required',
      });
    }

    // Parse request body
    const body = await readBody<FamilyTreeUpdate>(event);

    // Validate input
    if (body.name !== undefined && body.name.trim().length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Tree name cannot be empty',
      });
    }

    // Build update object
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.is_default !== undefined) updateData.is_default = body.is_default;

    // Update the tree
    const { data, error } = await supabase
      .from('family_trees')
      .update(updateData)
      .eq('id', treeId)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          message: 'Family tree not found',
        });
      }
      console.error('Error updating family tree:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to update family tree',
        data: error,
      });
    }

    return {
      success: true,
      data: data as FamilyTree,
      message: 'Family tree updated successfully',
    };
  } catch (err: any) {
    console.error('Server error updating family tree:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Internal server error',
    });
  }
});
