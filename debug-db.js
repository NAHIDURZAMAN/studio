// Debug script to check database schema
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('Checking database schema...');
  
  // Check if discount columns exist by trying to query them
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, discount_percentage, discount_price')
    .limit(1);

  if (error) {
    console.error('Error querying discount columns:', error);
    console.log('This usually means the columns do not exist in the database.');
  } else {
    console.log('✅ Discount columns exist! Sample data:', data);
  }

  // Also check the full structure of one product
  const { data: fullProduct, error: fullError } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (!fullError && fullProduct && fullProduct[0]) {
    console.log('Available columns:', Object.keys(fullProduct[0]));
  }
}

checkSchema();
