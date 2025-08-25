// Test RLS policies
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testPermissions() {
  console.log('Testing permissions...');
  
  // Test if we can read (should work)
  const { data: readData, error: readError } = await supabase
    .from('products')
    .select('id, name, price')
    .limit(1);
    
  console.log('READ test:', readError ? 'FAILED' : 'SUCCESS', readError || readData);
  
  // Test if we can update (might fail due to RLS)
  const { data: updateData, error: updateError } = await supabase
    .from('products')
    .update({ name: 'test' })
    .eq('id', 999) // Non-existent ID to avoid actually changing data
    .select();
    
  console.log('UPDATE test:', updateError ? 'FAILED' : 'SUCCESS');
  if (updateError) {
    console.log('Update error:', updateError.message);
    console.log('Error code:', updateError.code);
  }
  
  // Test if we can insert (might fail due to RLS)
  const { data: insertData, error: insertError } = await supabase
    .from('products')
    .insert({ name: 'test-product', price: 100 })
    .select();
    
  console.log('INSERT test:', insertError ? 'FAILED' : 'SUCCESS');
  if (insertError) {
    console.log('Insert error:', insertError.message);
    console.log('Error code:', insertError.code);
  }
}

testPermissions();
