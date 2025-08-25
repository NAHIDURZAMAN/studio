-- Multi-Product Orders System Migration
-- Run this in your Supabase SQL Editor

-- Create the multi_orders table
CREATE TABLE IF NOT EXISTS multi_orders (
  id SERIAL PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  items JSONB NOT NULL, -- Array of products with details
  total_items INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_charge DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  secondary_phone TEXT,
  customer_email TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'bkash', 'nagad', 'trust', 'brac')),
  delivery_location TEXT NOT NULL CHECK (delivery_location IN ('dhaka', 'outside')),
  transaction_id TEXT,
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_multi_orders_order_id ON multi_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_multi_orders_status ON multi_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_multi_orders_created_at ON multi_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_multi_orders_phone ON multi_orders(customer_phone);

-- Enable RLS (Row Level Security)
ALTER TABLE multi_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow public to insert orders (customers can place orders)
CREATE POLICY "Enable public inserts on multi_orders" ON multi_orders
FOR INSERT TO public
WITH CHECK (true);

-- Allow public to read their own orders (by phone number)
CREATE POLICY "Enable users to read own orders" ON multi_orders
FOR SELECT TO public
USING (true); -- You can restrict this later: USING (customer_phone = current_user_phone())

-- Allow admin updates (for order management)
CREATE POLICY "Enable admin updates on multi_orders" ON multi_orders
FOR UPDATE TO public
USING (true); -- You can restrict this to admin role later

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_multi_orders_updated_at 
BEFORE UPDATE ON multi_orders 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Example of what the items JSONB will look like:
-- [
--   {
--     "product_id": 1,
--     "product_name": "X Style Premium Tee",
--     "size": "L",
--     "quantity": 2,
--     "unit_price": 300,
--     "subtotal": 600
--   },
--   {
--     "product_id": 2,
--     "product_name": "Drop Shoulder Hoodie", 
--     "size": "XL",
--     "quantity": 1,
--     "unit_price": 800,
--     "subtotal": 800
--   }
-- ]

-- Sample query to test:
-- INSERT INTO multi_orders (
--   order_id, items, total_items, subtotal, total_price,
--   customer_name, customer_phone, customer_email, customer_address,
--   payment_method, delivery_location
-- ) VALUES (
--   'XS123456789',
--   '[{"product_id": 1, "product_name": "Test Tee", "size": "L", "quantity": 2, "unit_price": 300, "subtotal": 600}]',
--   2, 600.00, 670.00,
--   'Test Customer', '01812345678', 'test@example.com', 'Test Address',
--   'cod', 'dhaka'
-- );
