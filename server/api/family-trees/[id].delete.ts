/**
 * DELETE /api/family-trees/:id
 * Deletes a specific family tree and all its members/relationships (cascade)
 */

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

    // Delete the tree (cascade will delete members and relationships)
    const { error } = await supabase
      .from('family_trees')
      .delete()
      .eq('id', treeId)
      .eq('user_id', user.user.id);

    if (error) {
      console.error('Error deleting family tree:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to delete family tree',
        data: error,
      });
    }

    return {
      success: true,
      message: 'Family tree deleted successfully',
    };
  } catch (err: any) {
    console.error('Server error deleting family tree:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Internal server error',
    });
  }
});
