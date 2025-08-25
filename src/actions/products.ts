"use server";

import { createClient } from '@supabase/supabase-js';

// Create a server-side Supabase client with service role (when available)
// For now, we'll use the anon key but with a different approach
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function updateProductAction(productId: number, updateData: {
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
}) {
  try {
    console.log('[SERVER ACTION] Updating product:', productId, updateData);
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select('*');

    if (error) {
      console.error('[SERVER ACTION] Update error:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }

    console.log('[SERVER ACTION] Update successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[SERVER ACTION] Error in updateProductAction:', error);
    throw error;
  }
}
