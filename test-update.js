// Test direct database update
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testUpdate() {
  console.log('Testing direct database update...');
  
  // First, let's see the current state of product ID 1
  const { data: before, error: beforeError } = await supabase
    .from('products')
    .select('id, name, price, discount_percentage, discount_price')
    .eq('id', 1)
    .single();

  if (beforeError) {
    console.error('Error fetching before state:', beforeError);
    return;
  }

  console.log('BEFORE update:', before);

  // Now let's try to update it
  const { data: updateResult, error: updateError } = await supabase
    .from('products')
    .update({
      discount_percentage: 25.5,
      discount_price: 260
    })
    .eq('id', 1)
    .select('id, name, price, discount_percentage, discount_price');

  if (updateError) {
    console.error('Error updating:', updateError);
    console.error('Update error details:', updateError.details);
    console.error('Update error message:', updateError.message);
  } else {
    console.log('Update result:', updateResult);
    if (updateResult && updateResult.length > 0) {
      console.log('AFTER update:', updateResult[0]);
      console.log('✅ Direct update successful!');
    } else {
      console.log('⚠️ Update completed but no data returned - checking manually...');
      
      // Manual check after update
      const { data: manualCheck, error: checkError } = await supabase
        .from('products')
        .select('id, name, price, discount_percentage, discount_price')
        .eq('id', 1)
        .single();
        
      if (!checkError) {
        console.log('Manual check AFTER update:', manualCheck);
      }
    }
  }
}

testUpdate();
