-- Simple SQL commands to add discount columns to products table
-- Copy and paste these commands one by one in your Supabase SQL Editor

-- 1. Add discount_percentage column (0-100%)
ALTER TABLE products ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0;

-- 2. Add discount_price column (calculated price after discount)
ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);

-- 3. Add constraint to ensure discount percentage is valid (0-100%)
ALTER TABLE products ADD CONSTRAINT products_discount_percentage_check 
CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- 4. Update existing products to have discount_percentage = 0
UPDATE products SET discount_percentage = 0 WHERE discount_percentage IS NULL;

-- 5. Check if columns were added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('discount_percentage', 'discount_price');
