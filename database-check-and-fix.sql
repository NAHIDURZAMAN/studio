-- STEP 1: Check if discount columns exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('discount_percentage', 'discount_price')
ORDER BY column_name;

-- If you get NO RESULTS, the columns don't exist. Run steps 2-4.
-- If you get results, the columns exist and the issue is elsewhere.

-- STEP 2: Add discount_percentage column
ALTER TABLE products ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0;

-- STEP 3: Add discount_price column  
ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);

-- STEP 4: Add validation constraint
ALTER TABLE products ADD CONSTRAINT products_discount_percentage_check 
CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- STEP 5: Verify columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('discount_percentage', 'discount_price')
ORDER BY column_name;

-- STEP 6: Test with sample data (optional)
UPDATE products SET 
  discount_percentage = 20, 
  discount_price = 800 
WHERE id = (SELECT id FROM products LIMIT 1);

-- STEP 7: Check if update worked
SELECT id, name, price, discount_percentage, discount_price 
FROM products 
WHERE discount_percentage > 0 
LIMIT 5;
