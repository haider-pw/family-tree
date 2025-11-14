/**
 * GET /api/family-trees
 * Fetches all family trees belonging to the authenticated user
 */

import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server';
import type { FamilyTree } from '~/types/database';

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
    // Fetch all family trees for the user (user.sub is the user ID from JWT)
    const { data, error } = await supabase
      .from('family_trees')
      .select('*')
      .eq('user_id', user.sub)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching family trees:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch family trees',
        data: error,
      });
    }

    return {
      success: true,
      data: data as FamilyTree[],
    };
  } catch (err: any) {
    console.error('Server error fetching family trees:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Internal server error',
    });
  }
});
