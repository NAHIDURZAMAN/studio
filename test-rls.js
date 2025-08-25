// Test database permissions with detailed analysis
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDatabaseRLS() {
  console.log('=== TESTING DATABASE RLS POLICIES ===');
  
  const testProductId = 1; // Using the product we've been testing with
  
  // 1. Check current data
  console.log('\n1. BEFORE UPDATE - Current data:');
  const { data: before, error: beforeError } = await supabase
    .from('products')
    .select('id, name, discount_percentage, discount_price')
    .eq('id', testProductId)
    .single();
  
  console.log('Current data:', before);
  if (beforeError) console.log('Before error:', beforeError);
  
  // 2. Test with simple field update (name)
  console.log('\n2. TESTING SIMPLE FIELD UPDATE (name):');
  const testName = `Test Name ${Date.now()}`;
  const { data: nameUpdate, error: nameError, status: nameStatus } = await supabase
    .from('products')
    .update({ name: testName })
    .eq('id', testProductId);
    
  console.log('Name update status:', nameStatus);
  console.log('Name update data:', nameUpdate);
  console.log('Name update error:', nameError);
  
  // Verify name update
  const { data: afterName } = await supabase
    .from('products')
    .select('name')
    .eq('id', testProductId)
    .single();
  console.log('Name after update:', afterName?.name);
  console.log('Name update worked:', afterName?.name === testName);
  
  // 3. Test discount field update only
  console.log('\n3. TESTING DISCOUNT FIELDS ONLY:');
  const testPercentage = 25.5;
  const testPrice = 275;
  
  const { data: discountUpdate, error: discountError, status: discountStatus } = await supabase
    .from('products')
    .update({ 
      discount_percentage: testPercentage,
      discount_price: testPrice 
    })
    .eq('id', testProductId);
    
  console.log('Discount update status:', discountStatus);
  console.log('Discount update data:', discountUpdate);
  console.log('Discount update error:', discountError);
  
  // Verify discount update
  const { data: afterDiscount } = await supabase
    .from('products')
    .select('discount_percentage, discount_price')
    .eq('id', testProductId)
    .single();
  console.log('Discounts after update:', afterDiscount);
  console.log('Discount update worked:', 
    afterDiscount?.discount_percentage === testPercentage && 
    afterDiscount?.discount_price === testPrice
  );
  
  // 4. Check if there are triggers or constraints
  console.log('\n4. TESTING WITH NULL VALUES:');
  const { data: nullUpdate, error: nullError } = await supabase
    .from('products')
    .update({ 
      discount_percentage: null,
      discount_price: null 
    })
    .eq('id', testProductId);
    
  console.log('Null update error:', nullError);
  
  // Verify
  const { data: afterNull } = await supabase
    .from('products')
    .select('discount_percentage, discount_price')
    .eq('id', testProductId)
    .single();
  console.log('After null update:', afterNull);
}

testDatabaseRLS();
