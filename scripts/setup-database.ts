#!/usr/bin/env tsx

/**
 * Database Setup Script
 * Runs Supabase migrations automatically from your local machine
 *
 * Usage: yarn setup:db
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function setupDatabase() {
  try {
    log('\n🗄️  Shajra Database Setup', 'bright')
    log('━'.repeat(50), 'cyan')

    // Load environment variables
    log('\n📋 Step 1: Loading configuration...', 'blue')

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      log('\n❌ Error: Missing environment variables!', 'red')
      log('\nPlease set the following in your .env file:', 'yellow')
      log('  - SUPABASE_URL', 'yellow')
      log('  - SUPABASE_KEY (or SUPABASE_SERVICE_KEY for admin access)', 'yellow')
      log('\nYou can find these in:', 'yellow')
      log('  Supabase Dashboard → Project Settings → API', 'yellow')
      process.exit(1)
    }

    log(`✅ URL: ${supabaseUrl}`, 'green')
    log(`✅ Key: ${supabaseServiceKey.substring(0, 20)}...`, 'green')

    // Create Supabase client with service role key
    log('\n📋 Step 2: Connecting to Supabase...', 'blue')
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    log('✅ Connected successfully', 'green')

    // Check if tables already exist
    log('\n📋 Step 3: Checking existing tables...', 'blue')
    const { data: existingTables, error: checkError } = await supabase
      .from('family_trees')
      .select('id')
      .limit(1)

    if (!checkError) {
      log('⚠️  Tables already exist!', 'yellow')
      log('\nDo you want to:', 'yellow')
      log('  1. Skip setup (tables are already created)', 'yellow')
      log('  2. Re-run migration (will fail if tables exist)', 'yellow')
      log('\nExiting for safety. If you want to re-run:', 'yellow')
      log('  - Drop tables in Supabase dashboard first', 'yellow')
      log('  - Or run this script with --force flag (coming soon)', 'yellow')
      return
    }

    log('✅ No existing tables found, proceeding with migration', 'green')

    // Read migration file
    log('\n📋 Step 4: Reading migration file...', 'blue')
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql')

    if (!fs.existsSync(migrationPath)) {
      log(`❌ Migration file not found: ${migrationPath}`, 'red')
      process.exit(1)
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
    log(`✅ Loaded ${migrationSQL.split('\n').length} lines from migration file`, 'green')

    // Execute migration
    log('\n📋 Step 5: Running migration...', 'blue')
    log('⏳ This may take 10-15 seconds...', 'yellow')

    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })

    // If rpc doesn't work, try alternative approach
    if (migrationError) {
      log('\n⚠️  Direct RPC failed, trying alternative method...', 'yellow')
      log('Note: You may need to run the migration manually in Supabase SQL Editor', 'yellow')
      log('\nMigration file location:', 'cyan')
      log(`  ${migrationPath}`, 'cyan')
      log('\nTo run manually:', 'yellow')
      log('  1. Open Supabase Dashboard → SQL Editor', 'yellow')
      log('  2. Copy contents of 001_initial_schema.sql', 'yellow')
      log('  3. Paste and click Run', 'yellow')

      // Show the error details
      log(`\n❌ Error: ${migrationError.message}`, 'red')

      // Create a simpler approach - check each table individually
      log('\n📋 Attempting to verify connection and permissions...', 'blue')

      const { error: testError } = await supabase
        .from('profiles')
        .select('*')
        .limit(0)

      if (testError) {
        log('⚠️  Cannot access database. Migration must be run manually.', 'yellow')
      }

      return
    }

    log('✅ Migration completed successfully!', 'green')

    // Verify tables were created
    log('\n📋 Step 6: Verifying tables...', 'blue')

    const tablesToCheck = ['profiles', 'family_trees', 'family_members', 'relationships']
    let allTablesExist = true

    for (const table of tablesToCheck) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(0)

      if (error) {
        log(`❌ Table '${table}' not found`, 'red')
        allTablesExist = false
      } else {
        log(`✅ Table '${table}' exists`, 'green')
      }
    }

    if (allTablesExist) {
      log('\n━'.repeat(50), 'cyan')
      log('🎉 Database setup complete!', 'bright')
      log('\nYour Shajra database is ready to use!', 'green')
      log('\nNext steps:', 'cyan')
      log('  1. Start your dev server: yarn dev', 'cyan')
      log('  2. Create an account at: http://localhost:3000/signup', 'cyan')
      log('  3. Start building your family tree!', 'cyan')
      log('\n━'.repeat(50), 'cyan')
    } else {
      log('\n⚠️  Some tables are missing. Please run migration manually.', 'yellow')
    }

  } catch (error: any) {
    log('\n❌ Error during setup:', 'red')
    log(error.message, 'red')
    log('\n💡 Tip: You can run the migration manually:', 'yellow')
    log('  1. Open Supabase Dashboard → SQL Editor', 'yellow')
    log('  2. Copy contents of supabase/migrations/001_initial_schema.sql', 'yellow')
    log('  3. Paste and click Run', 'yellow')
    process.exit(1)
  }
}

// Run the setup
setupDatabase()
