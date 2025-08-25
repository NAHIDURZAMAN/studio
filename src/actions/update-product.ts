"use server";

import { createClient } from '@supabase/supabase-js';

// Create a server-side client that can bypass RLS if needed
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function updateProductServer(
  productId: number,
  updateData: {
    name: string;
    description?: string;
    price: number;
    discount_percentage?: number;
    discount_price?: number;
    category: string;
    color: string;
    stock: number;
    sizes: string[];
    data_ai_hint?: string;
    images: string[];
  }
) {
  console.log('[SERVER ACTION] Attempting to update product:', productId);
  console.log('[SERVER ACTION] Update data:', updateData);

  try {
    // First, try to get the current product to verify it exists
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.error('[SERVER ACTION] Error fetching current product:', fetchError);
      throw new Error(`Could not find product with ID ${productId}: ${fetchError.message}`);
    }

    console.log('[SERVER ACTION] Current product found:', currentProduct);

    // Now attempt the update
    const { data: updatedData, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select('*');

    if (updateError) {
      console.error('[SERVER ACTION] Update error:', updateError);
      throw new Error(`Failed to update product: ${updateError.message}`);
    }

    console.log('[SERVER ACTION] Update result:', updatedData);

    // Verify the update worked
    const { data: verifyData, error: verifyError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (verifyError) {
      console.error('[SERVER ACTION] Verify error:', verifyError);
      throw new Error(`Could not verify update: ${verifyError.message}`);
    }

    console.log('[SERVER ACTION] Verified data:', verifyData);

    // Check if discount values were actually saved
    const discountSaved = (
      Math.abs((verifyData.discount_percentage || 0) - (updateData.discount_percentage || 0)) < 0.1 &&
      Math.abs((verifyData.discount_price || 0) - (updateData.discount_price || 0)) < 1
    );

    if (!discountSaved) {
      console.error('[SERVER ACTION] Discount values were not saved correctly');
      console.error('[SERVER ACTION] Expected:', {
        discount_percentage: updateData.discount_percentage,
        discount_price: updateData.discount_price
      });
      console.error('[SERVER ACTION] Got:', {
        discount_percentage: verifyData.discount_percentage,
        discount_price: verifyData.discount_price
      });
      throw new Error('Discount values were not saved to database');
    }

    return {
      success: true,
      data: verifyData
    };

  } catch (error) {
    console.error('[SERVER ACTION] Failed to update product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
