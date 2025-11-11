/**
 * Composable for Family Tree CRUD Operations
 * Provides reactive state and methods for managing family trees
 * SSR-safe implementation
 */

import type {
  FamilyTree,
  FamilyTreeInput,
  FamilyTreeUpdate,
  FamilyTreeWithMembers,
  FamilyTreeChartData,
} from '~/types/database';

export const useFamilyTree = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // ============================================================================
  // Reactive State
  // ============================================================================

  const trees = ref<FamilyTree[]>([]);
  const currentTree = ref<FamilyTree | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ============================================================================
  // Fetch User's Family Trees
  // ============================================================================

  /**
   * Fetches all family trees belonging to the current user
   * @returns Array of family trees or null if error
   */
  const fetchTrees = async (): Promise<FamilyTree[] | null> => {
    if (!user.value) {
      error.value = 'User not authenticated';
      return null;
    }

    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from('family_trees')
        .select('*')
        .eq('user_id', user.value.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      trees.value = data || [];

      // Set current tree to default or first tree
      if (trees.value.length > 0 && !currentTree.value) {
        currentTree.value = trees.value.find(t => t.is_default) || trees.value[0];
      }

      return trees.value;
    } catch (err: any) {
      console.error('Error fetching family trees:', err);
      error.value = err.message || 'Failed to fetch family trees';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ============================================================================
  // Fetch Single Tree with Members
  // ============================================================================

  /**
   * Fetches a single family tree with all its members and relationships
   * @param treeId - UUID of the tree to fetch
   * @returns Tree with members and relationships, or null if error
   */
  const fetchTreeWithMembers = async (
    treeId: string
  ): Promise<FamilyTreeWithMembers | null> => {
    if (!user.value) {
      error.value = 'User not authenticated';
      return null;
    }

    try {
      loading.value = true;
      error.value = null;

      // Fetch tree
      const { data: treeData, error: treeError } = await supabase
        .from('family_trees')
        .select('*')
        .eq('id', treeId)
        .eq('user_id', user.value.id)
        .single();

      if (treeError) throw treeError;
      if (!treeData) throw new Error('Tree not found');

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select('*')
        .eq('tree_id', treeId);

      if (membersError) throw membersError;

      // Fetch relationships
      const { data: relationshipsData, error: relationshipsError } = await supabase
        .from('relationships')
        .select('*')
        .eq('tree_id', treeId);

      if (relationshipsError) throw relationshipsError;

      return {
        tree: treeData,
        members: membersData || [],
        relationships: relationshipsData || [],
      };
    } catch (err: any) {
      console.error('Error fetching tree with members:', err);
      error.value = err.message || 'Failed to fetch tree data';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ============================================================================
  // Create New Family Tree
  // ============================================================================

  /**
   * Creates a new family tree for the current user
   * @param input - Tree data to create
   * @returns Created tree or null if error
   */
  const createTree = async (input: FamilyTreeInput): Promise<FamilyTree | null> => {
    if (!user.value) {
      error.value = 'User not authenticated';
      return null;
    }

    try {
      loading.value = true;
      error.value = null;

      // Validate input
      if (!input.name || input.name.trim().length === 0) {
        throw new Error('Tree name is required');
      }

      const { data, error: createError } = await supabase
        .from('family_trees')
        .insert({
          user_id: user.value.id,
          name: input.name.trim(),
          description: input.description || null,
          is_default: input.is_default || false,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add to local state
      if (data) {
        trees.value.push(data);

        // Set as current if it's the default or only tree
        if (data.is_default || trees.value.length === 1) {
          currentTree.value = data;
        }
      }

      return data;
    } catch (err: any) {
      console.error('Error creating family tree:', err);
      error.value = err.message || 'Failed to create family tree';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ============================================================================
  // Update Family Tree
  // ============================================================================

  /**
   * Updates an existing family tree
   * @param treeId - UUID of the tree to update
   * @param update - Fields to update
   * @returns Updated tree or null if error
   */
  const updateTree = async (
    treeId: string,
    update: FamilyTreeUpdate
  ): Promise<FamilyTree | null> => {
    if (!user.value) {
      error.value = 'User not authenticated';
      return null;
    }

    try {
      loading.value = true;
      error.value = null;

      // Validate input
      if (update.name !== undefined && update.name.trim().length === 0) {
        throw new Error('Tree name cannot be empty');
      }

      const updateData: any = {};
      if (update.name !== undefined) updateData.name = update.name.trim();
      if (update.description !== undefined) updateData.description = update.description;
      if (update.is_default !== undefined) updateData.is_default = update.is_default;

      const { data, error: updateError } = await supabase
        .from('family_trees')
        .update(updateData)
        .eq('id', treeId)
        .eq('user_id', user.value.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      if (data) {
        const index = trees.value.findIndex(t => t.id === treeId);
        if (index !== -1) {
          trees.value[index] = data;
        }

        if (currentTree.value?.id === treeId) {
          currentTree.value = data;
        }
      }

      return data;
    } catch (err: any) {
      console.error('Error updating family tree:', err);
      error.value = err.message || 'Failed to update family tree';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ============================================================================
  // Delete Family Tree
  // ============================================================================

  /**
   * Deletes a family tree and all its members/relationships (cascade)
   * @param treeId - UUID of the tree to delete
   * @returns true if successful, false otherwise
   */
  const deleteTree = async (treeId: string): Promise<boolean> => {
    if (!user.value) {
      error.value = 'User not authenticated';
      return false;
    }

    try {
      loading.value = true;
      error.value = null;

      const { error: deleteError } = await supabase
        .from('family_trees')
        .delete()
        .eq('id', treeId)
        .eq('user_id', user.value.id);

      if (deleteError) throw deleteError;

      // Update local state
      trees.value = trees.value.filter(t => t.id !== treeId);

      if (currentTree.value?.id === treeId) {
        currentTree.value = trees.value[0] || null;
      }

      return true;
    } catch (err: any) {
      console.error('Error deleting family tree:', err);
      error.value = err.message || 'Failed to delete family tree';
      return false;
    } finally {
      loading.value = false;
    }
  };

  // ============================================================================
  // Set Current Tree
  // ============================================================================

  /**
   * Sets the currently active tree
   * @param treeId - UUID of the tree to set as current
   */
  const setCurrentTree = (treeId: string) => {
    const tree = trees.value.find(t => t.id === treeId);
    if (tree) {
      currentTree.value = tree;
    }
  };

  // ============================================================================
  // Get Default Tree
  // ============================================================================

  /**
   * Gets the user's default family tree
   * @returns Default tree or first tree if no default set
   */
  const getDefaultTree = (): FamilyTree | null => {
    return trees.value.find(t => t.is_default) || trees.value[0] || null;
  };

  // ============================================================================
  // Return Public API
  // ============================================================================

  return {
    // State
    trees: readonly(trees),
    currentTree: readonly(currentTree),
    loading: readonly(loading),
    error: readonly(error),

    // Methods
    fetchTrees,
    fetchTreeWithMembers,
    createTree,
    updateTree,
    deleteTree,
    setCurrentTree,
    getDefaultTree,
  };
};
