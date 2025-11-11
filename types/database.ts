/**
 * Database Types for Supabase
 * These types represent the database schema for the Shajra family tree application
 */

// ============================================================================
// Core Database Types
// ============================================================================

/**
 * User profile extending auth.users
 */
export interface Profile {
  id: string; // UUID referencing auth.users(id)
  full_name: string | null;
  avatar_url: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Family tree owned by a user
 */
export interface FamilyTree {
  id: string; // UUID
  user_id: string; // UUID referencing profiles(id)
  name: string;
  description: string | null;
  is_default: boolean;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Individual family member in a tree
 */
export interface FamilyMember {
  id: string; // UUID
  tree_id: string; // UUID referencing family_trees(id)
  name: string;
  gender: 'M' | 'F';
  birth_year: number | null;
  death_year: number | null;
  img: string | null;
  notes: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Relationship between family members
 */
export interface Relationship {
  id: string; // UUID
  tree_id: string; // UUID referencing family_trees(id)
  member_id: string; // UUID referencing family_members(id)
  related_member_id: string; // UUID referencing family_members(id)
  relationship_type: 'spouse' | 'parent' | 'child';
  created_at: string; // ISO timestamp
}

// ============================================================================
// Input Types (for creating/updating records)
// ============================================================================

/**
 * Input for creating a new profile
 */
export interface ProfileInput {
  id: string; // Must match auth.users(id)
  full_name?: string | null;
  avatar_url?: string | null;
}

/**
 * Input for updating a profile
 */
export interface ProfileUpdate {
  full_name?: string | null;
  avatar_url?: string | null;
}

/**
 * Input for creating a new family tree
 */
export interface FamilyTreeInput {
  name: string;
  description?: string | null;
  is_default?: boolean;
}

/**
 * Input for updating a family tree
 */
export interface FamilyTreeUpdate {
  name?: string;
  description?: string | null;
  is_default?: boolean;
}

/**
 * Input for creating a new family member
 */
export interface FamilyMemberInput {
  tree_id: string;
  name: string;
  gender: 'M' | 'F';
  birth_year?: number | null;
  death_year?: number | null;
  img?: string | null;
  notes?: string | null;
}

/**
 * Input for updating a family member
 */
export interface FamilyMemberUpdate {
  name?: string;
  gender?: 'M' | 'F';
  birth_year?: number | null;
  death_year?: number | null;
  img?: string | null;
  notes?: string | null;
}

/**
 * Input for creating a relationship
 */
export interface RelationshipInput {
  tree_id: string;
  member_id: string;
  related_member_id: string;
  relationship_type: 'spouse' | 'parent' | 'child';
}

// ============================================================================
// Family Chart Data Types (for family-chart library)
// ============================================================================

/**
 * Relationships structure for family-chart library
 */
export interface FamilyChartRelationships {
  parents?: string[]; // Array of parent IDs
  spouses?: string[]; // Array of spouse IDs
  children?: string[]; // Array of children IDs
}

/**
 * Data structure for individual family member in chart
 */
export interface FamilyChartMemberData {
  gender: 'M' | 'F';
  name: string;
  img?: string;
  birth_year?: number | null;
  death_year?: number | null;
}

/**
 * Complete family member node for family-chart library
 */
export interface FamilyChartNode {
  id: string; // UUID from database
  data: FamilyChartMemberData;
  rels: FamilyChartRelationships;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Response for fetching a family tree with all members and relationships
 */
export interface FamilyTreeWithMembers {
  tree: FamilyTree;
  members: FamilyMember[];
  relationships: Relationship[];
}

/**
 * Transformed data ready for family-chart visualization
 */
export interface FamilyTreeChartData {
  tree: FamilyTree;
  chartData: FamilyChartNode[];
}

/**
 * Generic API success response
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Generic API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: any;
}

/**
 * Combined API response type
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return !response.success;
}

/**
 * Database table names for type safety
 */
export const DB_TABLES = {
  PROFILES: 'profiles',
  FAMILY_TREES: 'family_trees',
  FAMILY_MEMBERS: 'family_members',
  RELATIONSHIPS: 'relationships',
} as const;

/**
 * Relationship types enum
 */
export const RELATIONSHIP_TYPES = {
  SPOUSE: 'spouse',
  PARENT: 'parent',
  CHILD: 'child',
} as const;

/**
 * Gender types enum
 */
export const GENDER_TYPES = {
  MALE: 'M',
  FEMALE: 'F',
} as const;

// ============================================================================
// Supabase Database Type Definition
// ============================================================================

/**
 * Full database schema type for Supabase client
 * This provides type safety when using the Supabase client
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInput;
        Update: ProfileUpdate;
      };
      family_trees: {
        Row: FamilyTree;
        Insert: Omit<FamilyTreeInput, 'user_id'> & { user_id?: string };
        Update: FamilyTreeUpdate;
      };
      family_members: {
        Row: FamilyMember;
        Insert: FamilyMemberInput;
        Update: FamilyMemberUpdate;
      };
      relationships: {
        Row: Relationship;
        Insert: RelationshipInput;
        Update: never; // Relationships are not updated, only created/deleted
      };
    };
    Views: {
      family_members_with_tree: {
        Row: FamilyMember & {
          user_id: string;
          tree_name: string;
        };
      };
    };
    Functions: {};
    Enums: {};
  };
}

// ============================================================================
// Typed Supabase Client
// ============================================================================

/**
 * Re-export SupabaseClient type with our database schema
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type TypedSupabaseClient = SupabaseClient<Database>;
