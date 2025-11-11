/**
 * GET /api/family-trees/:id
 * Fetches a specific family tree with all members and relationships
 */

import type { FamilyTreeWithMembers } from '~/types/database';

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

    // Fetch the tree and verify ownership
    const { data: treeData, error: treeError } = await supabase
      .from('family_trees')
      .select('*')
      .eq('id', treeId)
      .eq('user_id', user.user.id)
      .single();

    if (treeError) {
      if (treeError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          message: 'Family tree not found',
        });
      }
      throw treeError;
    }

    // Fetch all members for this tree
    const { data: membersData, error: membersError } = await supabase
      .from('family_members')
      .select('*')
      .eq('tree_id', treeId);

    if (membersError) {
      console.error('Error fetching family members:', membersError);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch family members',
        data: membersError,
      });
    }

    // Fetch all relationships for this tree
    const { data: relationshipsData, error: relationshipsError } = await supabase
      .from('relationships')
      .select('*')
      .eq('tree_id', treeId);

    if (relationshipsError) {
      console.error('Error fetching relationships:', relationshipsError);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch relationships',
        data: relationshipsError,
      });
    }

    const result: FamilyTreeWithMembers = {
      tree: treeData,
      members: membersData || [],
      relationships: relationshipsData || [],
    };

    return {
      success: true,
      data: result,
    };
  } catch (err: any) {
    console.error('Server error fetching family tree:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Internal server error',
    });
  }
});
