const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Read .env.local file
const envContent = fs.readFileSync('.env.local', 'utf8')
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim()
const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' }
})

async function runMigrations() {
  console.log('Checking database migrations...\n')
  
  // Check for paid column in installments
  console.log('1. Checking paid column in installments table...')
  const { error: paidError } = await supabase
    .from('installments')
    .select('paid')
    .limit(1)
  
  if (paidError && (paidError.code === '42703' || paidError.message.includes('paid'))) {
    console.log('   ❌ Column "paid" does not exist')
    console.log('   📝 SQL to run:')
    console.log('      ALTER TABLE installments ADD COLUMN paid BOOLEAN DEFAULT false;\n')
  } else if (paidError) {
    console.log('   ⚠️  Unexpected error:', paidError.message)
  } else {
    console.log('   ✅ Column "paid" exists\n')
  }

  // Check for invoices table
  console.log('2. Checking invoices table...')
  const { error: invoicesError } = await supabase
    .from('invoices')
    .select('id')
    .limit(1)
  
  if (invoicesError) {
    console.log('   ❌ Table "invoices" does not exist')
    console.log('   📝 Run this SQL in Supabase SQL Editor:\n')
    const migrationContent = fs.readFileSync('./database/migrations/migration_18_create_invoices_table.sql', 'utf8')
    console.log('--------------------------------------')
    console.log(migrationContent)
    console.log('--------------------------------------\n')
  } else {
    console.log('   ✅ Table "invoices" exists\n')
  }

  console.log('\n📋 Summary:')
  console.log('After running the required migrations, the application will:')
  console.log('• Track invoice status (draft, sent, viewed, paid, overdue, cancelled)')
  console.log('• Auto-generate invoice numbers (INV0000001, INV0000002, etc.)')
  console.log('• Display invoices list under installments')
  console.log('• Support Stripe integration for payment processing')
  console.log('• Automatically mark installments as paid when invoice is paid')
}

runMigrations()
