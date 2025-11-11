/**
 * POST /api/family-trees
 * Creates a new family tree for the authenticated user
 */

import type { FamilyTree, FamilyTreeInput } from '~/types/database';

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
    const body = await readBody<FamilyTreeInput>(event);

    // Validate input
    if (!body.name || body.name.trim().length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Tree name is required',
      });
    }

    // Create the family tree
    const { data, error } = await supabase
      .from('family_trees')
      .insert({
        user_id: user.user.id,
        name: body.name.trim(),
        description: body.description || null,
        is_default: body.is_default || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating family tree:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to create family tree',
        data: error,
      });
    }

    return {
      success: true,
      data: data as FamilyTree,
      message: 'Family tree created successfully',
    };
  } catch (err: any) {
    console.error('Server error creating family tree:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Internal server error',
    });
  }
});
