/**
 * GET /api/family-trees
 * Fetches all family trees belonging to the authenticated user
 */

import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server';
import { parseCookies } from 'h3';
import type { FamilyTree } from '~/types/database';

export default defineEventHandler(async (event) => {
  try {
    // Check if Supabase environment variables are configured
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      throw createError({
        statusCode: 500,
        message: 'Server configuration error - Supabase credentials not configured',
      });
    }

    // Try to get the Supabase client first
    let supabase;
    try {
      supabase = await serverSupabaseClient(event);
    } catch (clientError: any) {
      console.error('Failed to create Supabase client:', clientError);
      throw createError({
        statusCode: 500,
        message: 'Failed to initialize database connection',
        data: { error: clientError.message },
      });
    }

    // Check user authentication with detailed logging
    let user;
    try {
      // Debug logging only in development
      if (process.dev) {
        const cookies = parseCookies(event);
        console.log('Cookies present:', Object.keys(cookies));
        console.log('Has sb-access-token:', cookies['sb-access-token'] ? 'Yes' : 'No');
        console.log('Has sb-refresh-token:', cookies['sb-refresh-token'] ? 'Yes' : 'No');

        // Check for new cookie format
        const supabaseCookies = Object.keys(cookies).filter(key => key.includes('supabase'));
        console.log('Supabase cookies found:', supabaseCookies);
      }

      user = await serverSupabaseUser(event);

      // Only log PII in development to avoid exposure in production
      if (process.dev) {
        console.log('User authenticated:', {
          id: user?.id,
          email: user?.email,
          sub: user?.sub,
          hasUser: !!user
        });
      }
    } catch (authError: any) {
      console.error('Authentication check failed:', authError);
      console.error('Error details:', authError.message);
      user = null;
    }

    // If no user, provide detailed error
    if (!user || !user.sub) {
      console.warn('Authentication failed - no user object');
      throw createError({
        statusCode: 401,
        message: 'Unauthorized - Please log in to see your family trees',
        data: {
          debug: 'No user object returned from serverSupabaseUser',
          hint: 'Check if cookies are being sent and session is valid'
        }
      });
    }

    // First, check if user has a profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.sub)
      .single();

    if (profileError) {
      console.error('Profile check error:', profileError);
      // If profile doesn't exist, create it
      if (profileError.code === 'PGRST116') { // Row not found
        if (process.dev) {
          console.log('Creating profile for user:', user.sub);
        }
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.sub,
            full_name: user.user_metadata?.full_name || user.email,
            avatar_url: user.user_metadata?.avatar_url
          });

        if (createProfileError) {
          console.error('Failed to create profile:', createProfileError);
          throw createError({
            statusCode: 500,
            message: 'Failed to create user profile',
            data: { error: createProfileError.message }
          });
        }
      }
    }

    // Fetch all family trees for the user
    // Note: Server uses user.sub here; client exposes the same identifier as user.id
    const { data, error } = await supabase
      .from('family_trees')
      .select('*')
      .eq('user_id', user.sub)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database query error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      // Provide more specific error messages
      if (error.code === '42P01') {
        throw createError({
          statusCode: 500,
          message: 'Database tables not found - migrations may not have been run',
          data: { error: error.message },
        });
      } else if (error.code === 'PGRST301') {
        throw createError({
          statusCode: 500,
          message: 'Row Level Security (RLS) policy error',
          data: { error: error.message },
        });
      } else {
        throw createError({
          statusCode: 500,
          message: `Database error: ${error.message}`,
          data: { error },
        });
      }
    }

    return {
      success: true,
      data: data as FamilyTree[],
    };
  } catch (err: any) {
    // If it's already a createError, pass it through
    if (err.statusCode) {
      throw err;
    }

    // Otherwise, wrap it
    console.error('Unexpected server error:', err);
    throw createError({
      statusCode: 500,
      message: err.message || 'Internal server error',
      data: { error: err.toString() },
    });
  }
});
