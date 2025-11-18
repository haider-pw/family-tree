/**
 * GET /api/health
 * Health check endpoint to verify Supabase configuration and database connectivity
 */

import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const health = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    checks: {
      environment: false,
      database: false,
      tables: false,
    },
    details: {} as any,
  };

  try {
    // Check 1: Environment Variables
    const hasUrl = !!process.env.SUPABASE_URL;
    const hasKey = !!process.env.SUPABASE_KEY;

    health.checks.environment = hasUrl && hasKey;
    health.details.environment = {
      hasUrl,
      hasKey,
      url: hasUrl ? process.env.SUPABASE_URL?.replace(/https:\/\/(.{5}).*\.supabase\.co/, 'https://$1...supabase.co') : null,
    };

    if (!health.checks.environment) {
      health.status = 'error';
      health.details.error = 'Missing Supabase environment variables';
      return health;
    }

    // Check 2: Database Connection
    try {
      const supabase = await serverSupabaseClient(event);
      health.checks.database = true;

      // Check 3: Tables exist
      const tables = ['profiles', 'family_trees', 'family_members', 'relationships'];
      const tableChecks: Record<string, boolean> = {};

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .select('count(*)', { count: 'exact', head: true });

        tableChecks[table] = !error;
        if (error && error.code === '42P01') {
          health.details[`table_${table}`] = 'Table does not exist';
        } else if (error) {
          health.details[`table_${table}`] = error.message;
        }
      }

      health.checks.tables = Object.values(tableChecks).every(v => v);
      health.details.tables = tableChecks;

    } catch (dbError: any) {
      health.checks.database = false;
      health.details.database_error = dbError.message;
    }

    // Overall status
    if (Object.values(health.checks).every(v => v)) {
      health.status = 'healthy';
    } else {
      health.status = 'unhealthy';
    }

    return health;
  } catch (error: any) {
    health.status = 'error';
    health.details.error = error.message;
    return health;
  }
});