/**
 * Pinia Store for Family Tree State Management
 * Manages the active family tree and provides actions for CRUD operations
 */

import { defineStore } from 'pinia';
import type {
  FamilyTree,
  FamilyMember,
  Relationship,
  FamilyChartNode,
  FamilyTreeInput,
  FamilyTreeUpdate,
  FamilyMemberInput,
  FamilyMemberUpdate,
} from '~/types/database';

interface FamilyTreeState {
  // Trees
  trees: FamilyTree[];
  activeTreeId: string | null;

  // Members and relationships for active tree
  members: FamilyMember[];
  relationships: Relationship[];

  // Chart data (transformed for visualization)
  chartData: FamilyChartNode[];

  // Loading and error states
  loading: boolean;
  error: string | null;

  // Flags
  isInitialized: boolean;
}

export const useFamilyTreeStore = defineStore('familyTree', {
  // ============================================================================
  // State
  // ============================================================================
  state: (): FamilyTreeState => ({
    trees: [],
    activeTreeId: null,
    members: [],
    relationships: [],
    chartData: [],
    loading: false,
    error: null,
    isInitialized: false,
  }),

  // ============================================================================
  // Getters
  // ============================================================================
  getters: {
    /**
     * Get the currently active tree
     */
    activeTree(state): FamilyTree | null {
      if (!state.activeTreeId) return null;
      return state.trees.find(t => t.id === state.activeTreeId) || null;
    },

    /**
     * Get the default tree
     */
    defaultTree(state): FamilyTree | null {
      return state.trees.find(t => t.is_default) || state.trees[0] || null;
    },

    /**
     * Check if there are any trees
     */
    hasTrees(state): boolean {
      return state.trees.length > 0;
    },

    /**
     * Check if there are any members in active tree
     */
    hasMembers(state): boolean {
      return state.members.length > 0;
    },

    /**
     * Get a member by ID
     */
    getMemberById: (state) => (memberId: string): FamilyMember | undefined => {
      return state.members.find(m => m.id === memberId);
    },

    /**
     * Get all members of a specific gender
     */
    getMembersByGender: (state) => (gender: 'M' | 'F'): FamilyMember[] => {
      return state.members.filter(m => m.gender === gender);
    },
  },

  // ============================================================================
  // Actions
  // ============================================================================
  actions: {
    /**
     * Initialize the store - fetch user's trees and set active tree
     */
    async initialize() {
      if (this.isInitialized) return;

      try {
        this.loading = true;
        this.error = null;

        await this.fetchTrees();

        // Set active tree to default or first tree
        if (this.trees.length > 0 && !this.activeTreeId) {
          const defaultTree = this.defaultTree;
          if (defaultTree) {
            await this.setActiveTree(defaultTree.id);
          }
        }

        this.isInitialized = true;
      } catch (err: any) {
        console.error('Error initializing store:', err);
        this.error = err.message || 'Failed to initialize';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch all trees for the current user
     */
    async fetchTrees() {
      try {
        this.loading = true;
        this.error = null;

        const response = await $fetch('/api/family-trees');

        if (response.success && response.data) {
          this.trees = response.data;
        }
      } catch (err: any) {
        console.error('Error fetching trees:', err);
        this.error = err.message || 'Failed to fetch trees';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Set the active tree and load its data
     */
    async setActiveTree(treeId: string) {
      try {
        this.loading = true;
        this.error = null;
        this.activeTreeId = treeId;

        // Store in localStorage for persistence
        if (process.client) {
          localStorage.setItem('activeTreeId', treeId);
        }

        // Fetch tree data
        await this.fetchTreeData(treeId);
      } catch (err: any) {
        console.error('Error setting active tree:', err);
        this.error = err.message || 'Failed to set active tree';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch data for a specific tree (members and relationships)
     */
    async fetchTreeData(treeId: string) {
      try {
        this.loading = true;
        this.error = null;

        const response = await $fetch(`/api/family-trees/${treeId}`);

        if (response.success && response.data) {
          this.members = response.data.members;
          this.relationships = response.data.relationships;

          // Transform to chart data
          this.chartData = this.transformToChartData();
        }
      } catch (err: any) {
        console.error('Error fetching tree data:', err);
        this.error = err.message || 'Failed to fetch tree data';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Create a new family tree
     */
    async createTree(input: FamilyTreeInput) {
      try {
        this.loading = true;
        this.error = null;

        const response = await $fetch('/api/family-trees', {
          method: 'POST',
          body: input,
        });

        if (response.success && response.data) {
          this.trees.push(response.data);

          // Set as active if it's the first or default tree
          if (response.data.is_default || this.trees.length === 1) {
            await this.setActiveTree(response.data.id);
          }

          return response.data;
        }
      } catch (err: any) {
        console.error('Error creating tree:', err);
        this.error = err.message || 'Failed to create tree';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update a family tree
     */
    async updateTree(treeId: string, update: FamilyTreeUpdate) {
      try {
        this.loading = true;
        this.error = null;

        const response = await $fetch(`/api/family-trees/${treeId}`, {
          method: 'PATCH',
          body: update,
        });

        if (response.success && response.data) {
          const index = this.trees.findIndex(t => t.id === treeId);
          if (index !== -1) {
            this.trees[index] = response.data;
          }

          return response.data;
        }
      } catch (err: any) {
        console.error('Error updating tree:', err);
        this.error = err.message || 'Failed to update tree';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Delete a family tree
     */
    async deleteTree(treeId: string) {
      try {
        this.loading = true;
        this.error = null;

        await $fetch(`/api/family-trees/${treeId}`, {
          method: 'DELETE',
        });

        // Remove from local state
        this.trees = this.trees.filter(t => t.id !== treeId);

        // If deleted tree was active, switch to another
        if (this.activeTreeId === treeId) {
          if (this.trees.length > 0) {
            await this.setActiveTree(this.trees[0].id);
          } else {
            this.activeTreeId = null;
            this.members = [];
            this.relationships = [];
            this.chartData = [];
          }
        }
      } catch (err: any) {
        console.error('Error deleting tree:', err);
        this.error = err.message || 'Failed to delete tree';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Create a new family member
     */
    async createMember(input: FamilyMemberInput) {
      try {
        this.loading = true;
        this.error = null;

        const response = await $fetch('/api/family-members', {
          method: 'POST',
          body: input,
        });

        if (response.success && response.data) {
          this.members.push(response.data);
          this.chartData = this.transformToChartData();

          return response.data;
        }
      } catch (err: any) {
        console.error('Error creating member:', err);
        this.error = err.message || 'Failed to create member';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update a family member
     */
    async updateMember(memberId: string, update: FamilyMemberUpdate) {
      try {
        this.loading = true;
        this.error = null;

        const response = await $fetch(`/api/family-members/${memberId}`, {
          method: 'PATCH',
          body: update,
        });

        if (response.success && response.data) {
          const index = this.members.findIndex(m => m.id === memberId);
          if (index !== -1) {
            this.members[index] = response.data;
          }
          this.chartData = this.transformToChartData();

          return response.data;
        }
      } catch (err: any) {
        console.error('Error updating member:', err);
        this.error = err.message || 'Failed to update member';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Delete a family member
     */
    async deleteMember(memberId: string) {
      try {
        this.loading = true;
        this.error = null;

        await $fetch(`/api/family-members/${memberId}`, {
          method: 'DELETE',
        });

        // Remove from local state
        this.members = this.members.filter(m => m.id !== memberId);
        this.relationships = this.relationships.filter(
          r => r.member_id !== memberId && r.related_member_id !== memberId
        );
        this.chartData = this.transformToChartData();
      } catch (err: any) {
        console.error('Error deleting member:', err);
        this.error = err.message || 'Failed to delete member';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Transform members and relationships to chart format
     */
    transformToChartData(): FamilyChartNode[] {
      const memberRelationships = new Map<string, {
        parents: string[];
        spouses: string[];
        children: string[];
      }>();

      // Initialize empty relationships for all members
      this.members.forEach(member => {
        memberRelationships.set(member.id, {
          parents: [],
          spouses: [],
          children: [],
        });
      });

      // Process each relationship
      this.relationships.forEach(rel => {
        const memberRels = memberRelationships.get(rel.member_id);
        const relatedMemberRels = memberRelationships.get(rel.related_member_id);

        if (!memberRels || !relatedMemberRels) return;

        switch (rel.relationship_type) {
          case 'spouse':
            if (!memberRels.spouses.includes(rel.related_member_id)) {
              memberRels.spouses.push(rel.related_member_id);
            }
            if (!relatedMemberRels.spouses.includes(rel.member_id)) {
              relatedMemberRels.spouses.push(rel.member_id);
            }
            break;

          case 'parent':
            if (!relatedMemberRels.parents.includes(rel.member_id)) {
              relatedMemberRels.parents.push(rel.member_id);
            }
            if (!memberRels.children.includes(rel.related_member_id)) {
              memberRels.children.push(rel.related_member_id);
            }
            break;

          case 'child':
            if (!memberRels.parents.includes(rel.related_member_id)) {
              memberRels.parents.push(rel.related_member_id);
            }
            if (!relatedMemberRels.children.includes(rel.member_id)) {
              relatedMemberRels.children.push(rel.member_id);
            }
            break;
        }
      });

      // Transform to chart format
      return this.members.map(member => {
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
            ...(rels.parents.length > 0 && { parents: rels.parents }),
            ...(rels.spouses.length > 0 && { spouses: rels.spouses }),
            ...(rels.children.length > 0 && { children: rels.children }),
          },
        };
      });
    },

    /**
     * Clear all state (useful for logout)
     */
    clearState() {
      this.$reset();
      if (process.client) {
        localStorage.removeItem('activeTreeId');
      }
    },

    /**
     * Restore active tree from localStorage
     */
    restoreActiveTree() {
      if (process.client) {
        const storedTreeId = localStorage.getItem('activeTreeId');
        if (storedTreeId && this.trees.some(t => t.id === storedTreeId)) {
          this.activeTreeId = storedTreeId;
        }
      }
    },
  },
});
