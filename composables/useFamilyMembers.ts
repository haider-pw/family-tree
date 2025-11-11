/**
 * Composable for Family Members CRUD Operations
 * Provides reactive state and methods for managing family members and relationships
 * SSR-safe implementation
 */

import type {
  FamilyMember,
  FamilyMemberInput,
  FamilyMemberUpdate,
  Relationship,
  RelationshipInput,
  FamilyChartNode,
  FamilyChartRelationships,
} from '~/types/database';

export const useFamilyMembers = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // ============================================================================
  // Reactive State
  // ============================================================================

  const members = ref<FamilyMember[]>([]);
  const relationships = ref<Relationship[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ============================================================================
  // Fetch Members for a Tree
  // ============================================================================

  /**
   * Fetches all family members for a given tree
   * @param treeId - UUID of the tree
   * @returns Array of family members or null if error
   */
  const fetchMembers = async (treeId: string): Promise<FamilyMember[] | null> => {
    if (!user.value) {
      error.value = 'User not authenticated';
      return null;
    }

    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from('family_members')
        .select('*')
        .eq('tree_id', treeId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      members.value = data || [];
      return members.value;
    } catch (err: any) {
      console.error('Error fetching family members:', err);
      error.value = err.message || 'Failed to fetch family members';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ============================================================================
  // Fetch Relationships for a Tree
  // ============================================================================

  /**
   * Fetches all relationships for a given tree
   * @param treeId - UUID of the tree
   * @returns Array of relationships or null if error
   */
  const fetchRelationships = async (treeId: string): Promise<Relationship[] | null> => {
    if (!user.value) {
      error.value = 'User not authenticated';
      return null;
    }

    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from('relationships')
        .select('*')
        .eq('tree_id', treeId);

      if (fetchError) throw fetchError;

      relationships.value = data || [];
      return relationships.value;
    } catch (err: any) {
      console.error('Error fetching relationships:', err);
      error.value = err.message || 'Failed to fetch relationships';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ============================================================================
  // Create Family Member
  // ============================================================================

  /**
   * Creates a new family member in a tree
   * @param input - Member data to create
   * @returns Created member or null if error
   */
  const createMember = async (input: FamilyMemberInput): Promise<FamilyMember | null> => {
    if (!user.value) {
      error.value = 'User not authenticated';
      return null;
    }

    try {
      loading.value = true;
      error.value = null;

      // Validate input
      if (!input.name || input.name.trim().length === 0) {
        throw new Error('Member name is required');
      }

      if (!['M', 'F'].includes(input.gender)) {
        throw new Error('Gender must be M or F');
      }

      if (input.birth_year && input.death_year && input.death_year < input.birth_year) {
        throw new Error('Death year cannot be before birth year');
      }

      const { data, error: createError } = await supabase
        .from('family_members')
        .insert({
          tree_id: input.tree_id,
          name: input.name.trim(),
          gender: input.gender,
          birth_year: input.birth_year || null,
          death_year: input.death_year || null,
          img: input.img || null,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add to local state
      if (data) {
        members.value.push(data);
      }

      return data;
    } catch (err: any) {
      console.error('Error creating family member:', err);
      error.value = err.message || 'Failed to create family member';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ============================================================================
  // Update Family Member
  // ============================================================================

  /**
   * Updates an existing family member
   * @param memberId - UUID of the member to update
   * @param update - Fields to update
   * @returns Updated member or null if error
   */
  const updateMember = async (
    memberId: string,
    update: FamilyMemberUpdate
  ): Promise<FamilyMember | null> => {
    if (!user.value) {
      error.value = 'User not authenticated';
      return null;
    }

    try {
      loading.value = true;
      error.value = null;

      // Validate input
      if (update.name !== undefined && update.name.trim().length === 0) {
        throw new Error('Member name cannot be empty');
      }

      if (update.gender !== undefined && !['M', 'F'].includes(update.gender)) {
        throw new Error('Gender must be M or F');
      }

      const updateData: any = {};
      if (update.name !== undefined) updateData.name = update.name.trim();
      if (update.gender !== undefined) updateData.gender = update.gender;
      if (update.birth_year !== undefined) updateData.birth_year = update.birth_year;
      if (update.death_year !== undefined) updateData.death_year = update.death_year;
      if (update.img !== undefined) updateData.img = update.img;
      if (update.notes !== undefined) updateData.notes = update.notes;

      const { data, error: updateError } = await supabase
        .from('family_members')
        .update(updateData)
        .eq('id', memberId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      if (data) {
        const index = members.value.findIndex(m => m.id === memberId);
        if (index !== -1) {
          members.value[index] = data;
        }
      }

      return data;
    } catch (err: any) {
      console.error('Error updating family member:', err);
      error.value = err.message || 'Failed to update family member';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ============================================================================
  // Delete Family Member
  // ============================================================================

  /**
   * Deletes a family member and all their relationships (cascade)
   * @param memberId - UUID of the member to delete
   * @returns true if successful, false otherwise
   */
  const deleteMember = async (memberId: string): Promise<boolean> => {
    if (!user.value) {
      error.value = 'User not authenticated';
      return false;
    }

    try {
      loading.value = true;
      error.value = null;

      const { error: deleteError } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (deleteError) throw deleteError;

      // Update local state
      members.value = members.value.filter(m => m.id !== memberId);
      relationships.value = relationships.value.filter(
        r => r.member_id !== memberId && r.related_member_id !== memberId
      );

      return true;
    } catch (err: any) {
      console.error('Error deleting family member:', err);
      error.value = err.message || 'Failed to delete family member';
      return false;
    } finally {
      loading.value = false;
    }
  };

  // ============================================================================
  // Create Relationship
  // ============================================================================

  /**
   * Creates a relationship between two family members
   * @param input - Relationship data
   * @returns Created relationship or null if error
   */
  const createRelationship = async (
    input: RelationshipInput
  ): Promise<Relationship | null> => {
    if (!user.value) {
      error.value = 'User not authenticated';
      return null;
    }

    try {
      loading.value = true;
      error.value = null;

      // Validate input
      if (input.member_id === input.related_member_id) {
        throw new Error('Cannot create relationship with self');
      }

      if (!['spouse', 'parent', 'child'].includes(input.relationship_type)) {
        throw new Error('Invalid relationship type');
      }

      const { data, error: createError } = await supabase
        .from('relationships')
        .insert({
          tree_id: input.tree_id,
          member_id: input.member_id,
          related_member_id: input.related_member_id,
          relationship_type: input.relationship_type,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add to local state
      if (data) {
        relationships.value.push(data);
      }

      return data;
    } catch (err: any) {
      console.error('Error creating relationship:', err);
      error.value = err.message || 'Failed to create relationship';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ============================================================================
  // Delete Relationship
  // ============================================================================

  /**
   * Deletes a relationship between family members
   * @param relationshipId - UUID of the relationship to delete
   * @returns true if successful, false otherwise
   */
  const deleteRelationship = async (relationshipId: string): Promise<boolean> => {
    if (!user.value) {
      error.value = 'User not authenticated';
      return false;
    }

    try {
      loading.value = true;
      error.value = null;

      const { error: deleteError } = await supabase
        .from('relationships')
        .delete()
        .eq('id', relationshipId);

      if (deleteError) throw deleteError;

      // Update local state
      relationships.value = relationships.value.filter(r => r.id !== relationshipId);

      return true;
    } catch (err: any) {
      console.error('Error deleting relationship:', err);
      error.value = err.message || 'Failed to delete relationship';
      return false;
    } finally {
      loading.value = false;
    }
  };

  // ============================================================================
  // Transform to Family Chart Format
  // ============================================================================

  /**
   * Transforms database members and relationships into family-chart format
   * @param treeMembers - Array of family members
   * @param treeRelationships - Array of relationships
   * @returns Array of FamilyChartNode objects for visualization
   */
  const transformToChartData = (
    treeMembers: FamilyMember[],
    treeRelationships: Relationship[]
  ): FamilyChartNode[] => {
    // Create a map to build relationships for each member
    const memberRelationships = new Map<string, FamilyChartRelationships>();

    // Initialize empty relationships for all members
    treeMembers.forEach(member => {
      memberRelationships.set(member.id, {
        parents: [],
        spouses: [],
        children: [],
      });
    });

    // Process each relationship
    treeRelationships.forEach(rel => {
      const memberRels = memberRelationships.get(rel.member_id);
      const relatedMemberRels = memberRelationships.get(rel.related_member_id);

      if (!memberRels || !relatedMemberRels) return;

      switch (rel.relationship_type) {
        case 'spouse':
          // Add bidirectional spouse relationship
          if (!memberRels.spouses!.includes(rel.related_member_id)) {
            memberRels.spouses!.push(rel.related_member_id);
          }
          if (!relatedMemberRels.spouses!.includes(rel.member_id)) {
            relatedMemberRels.spouses!.push(rel.member_id);
          }
          break;

        case 'parent':
          // member_id is parent of related_member_id
          // Add member as parent to related member
          if (!relatedMemberRels.parents!.includes(rel.member_id)) {
            relatedMemberRels.parents!.push(rel.member_id);
          }
          // Add related member as child to member
          if (!memberRels.children!.includes(rel.related_member_id)) {
            memberRels.children!.push(rel.related_member_id);
          }
          break;

        case 'child':
          // member_id is child of related_member_id
          // Add related member as parent to member
          if (!memberRels.parents!.includes(rel.related_member_id)) {
            memberRels.parents!.push(rel.related_member_id);
          }
          // Add member as child to related member
          if (!relatedMemberRels.children!.includes(rel.member_id)) {
            relatedMemberRels.children!.push(rel.member_id);
          }
          break;
      }
    });

    // Transform to chart format
    return treeMembers.map(member => {
      const rels = memberRelationships.get(member.id)!;

      return {
        id: member.id,
        data: {
          gender: member.gender,
          name: member.name,
          img: member.img || undefined,
          birth_year: member.birth_year,
          death_year: member.death_year,
        },
        rels: {
          ...(rels.parents!.length > 0 && { parents: rels.parents }),
          ...(rels.spouses!.length > 0 && { spouses: rels.spouses }),
          ...(rels.children!.length > 0 && { children: rels.children }),
        },
      };
    });
  };

  // ============================================================================
  // Get Chart Data for Tree
  // ============================================================================

  /**
   * Fetches members and relationships for a tree and returns chart-ready data
   * @param treeId - UUID of the tree
   * @returns Array of FamilyChartNode objects or null if error
   */
  const getChartData = async (treeId: string): Promise<FamilyChartNode[] | null> => {
    try {
      // Fetch both members and relationships
      await Promise.all([fetchMembers(treeId), fetchRelationships(treeId)]);

      if (error.value) return null;

      // Transform to chart format
      return transformToChartData(members.value, relationships.value);
    } catch (err: any) {
      console.error('Error getting chart data:', err);
      error.value = err.message || 'Failed to get chart data';
      return null;
    }
  };

  // ============================================================================
  // Return Public API
  // ============================================================================

  return {
    // State
    members: readonly(members),
    relationships: readonly(relationships),
    loading: readonly(loading),
    error: readonly(error),

    // Methods
    fetchMembers,
    fetchRelationships,
    createMember,
    updateMember,
    deleteMember,
    createRelationship,
    deleteRelationship,
    transformToChartData,
    getChartData,
  };
};
