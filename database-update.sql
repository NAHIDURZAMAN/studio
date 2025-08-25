-- Add discount columns to products table if they don't exist
-- This can be run in the Supabase SQL editor

-- Add discount_percentage column
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='products' AND column_name='discount_percentage'
    ) THEN 
        ALTER TABLE products ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0;
    END IF; 
END $$;

-- Add discount_price column
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='products' AND column_name='discount_price'
    ) THEN 
        ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);
    END IF; 
END $$;

-- Update any existing products to have discount_percentage = 0 if NULL
UPDATE products SET discount_percentage = 0 WHERE discount_percentage IS NULL;

-- Optional: Add a constraint to ensure discount_percentage is between 0 and 100
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'products_discount_percentage_check'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT products_discount_percentage_check 
        CHECK (discount_percentage >= 0 AND discount_percentage <= 100);
    END IF;
END $$;
