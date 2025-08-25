// Test with RLS bypass attempt
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Try to create client with different options
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testWithAuth() {
  console.log('Testing with auth bypass...');
  
  // Try to authenticate as a user first (if there's a way)
  // For now, let's try the direct update with more detailed error info
  
  const { data: updateData, error: updateError, status, statusText } = await supabase
    .from('products')
    .update({
      discount_percentage: 30.0,
      discount_price: 245
    })
    .eq('id', 1);
    
  console.log('Status:', status, statusText);
  console.log('Update data:', updateData);
  console.log('Update error:', updateError);
  
  if (updateError) {
    console.log('Error details:');
    console.log('- Message:', updateError.message);
    console.log('- Code:', updateError.code);
    console.log('- Details:', updateError.details);
    console.log('- Hint:', updateError.hint);
  }
}

testWithAuth();
