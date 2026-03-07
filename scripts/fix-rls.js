const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Read .env.local to get config
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')

const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]
const serviceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase config in .env.local')
  process.exit(1)
}

// Get project ref from URL
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '')

// Direct database URL (pooler)
const databaseUrl = `postgresql://postgres:${serviceKey}@db.${projectRef}.supabase.co:6543/postgres?sslmode=require`

async function main() {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('Connecting to Supabase database...')
    const client = await pool.connect()

    // Test connection
    const test = await client.query('SELECT current_user, current_database()')
    console.log('Connected as:', test.rows[0])

    // SQL statements to fix RLS policies
    const statements = [
      // Drop unsafe policies
      `DROP POLICY IF EXISTS "public_insert_user_profiles" ON user_profiles`,
      `DROP POLICY IF EXISTS "public_update_user_profiles" ON user_profiles`,
      `DROP POLICY IF EXISTS "public_insert_weddings" ON weddings`,
      `DROP POLICY IF EXISTS "public_update_weddings" ON weddings`,
      `DROP POLICY IF EXISTS "public_insert_wedding_plans" ON wedding_plans`,
      `DROP POLICY IF EXISTS "public_update_wedding_plans" ON wedding_plans`,
    ]

    console.log('\nDropping unsafe policies...')
    for (const sql of statements) {
      try {
        await client.query(sql)
        console.log(`  ✓ ${sql}`)
      } catch (err) {
        if (err.message.includes('does not exist')) {
          console.log(`  - ${sql} (not found, skip)`)
        } else {
          console.log(`  ✗ ${err.message}`)
        }
      }
    }

    // Create safe policies
    const createStatements = [
      // user_profiles - user can only insert/update their own profile
      `CREATE POLICY "Users can insert own profile"
        ON user_profiles FOR INSERT
        WITH CHECK (auth.uid() = id)`,

      `CREATE POLICY "Users can update own profile"
        ON user_profiles FOR UPDATE
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id)`,

      // Service role can manage everything
      `CREATE POLICY "Service role can manage user_profiles"
        ON user_profiles FOR ALL
        USING (auth.role() = 'service_role')
        WITH CHECK (auth.role() = 'service_role')`,

      // wedding_plans - service role only
      `CREATE POLICY "Service role can manage wedding_plans"
        ON wedding_plans FOR ALL
        USING (auth.role() = 'service_role')
        WITH CHECK (auth.role() = 'service_role')`,

      // weddings - service role only
      `CREATE POLICY "Service role can manage weddings"
        ON weddings FOR ALL
        USING (auth.role() = 'service_role')
        WITH CHECK (auth.role() = 'service_role')`,
    ]

    console.log('\nCreating safe policies...')
    for (const sql of createStatements) {
      try {
        await client.query(sql)
        console.log(`  ✓ Created policy`)
      } catch (err) {
        console.log(`  ✗ ${err.message}`)
      }
    }

    // Verify current policies
    console.log('\nVerifying user_profiles policies:')
    const policies = await client.query(`
      SELECT policyname, cmd, permissive, with_check
      FROM pg_policies
      WHERE tablename = 'user_profiles'
    `)
    for (const p of policies.rows) {
      console.log(`  - ${p.policyname}: ${p.cmd} (with_check: ${p.with_check})`)
    }

    client.release()
    await pool.end()

    console.log('\n✅ RLS policy fix completed!')

  } catch (err) {
    console.error('Error:', err.message)
    await pool.end()
    process.exit(1)
  }
}

main()
