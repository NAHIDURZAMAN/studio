-- Products table schema
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('Drop Shoulder Tees', 'Jerseys', 'Hoodies', 'Basic Collection')),
    price DECIMAL(10,2) NOT NULL,
    color TEXT CHECK (color IN ('Black', 'White', 'Navy', 'Grey', 'Other')),
    images TEXT[] NOT NULL DEFAULT '{}',
    stock INTEGER DEFAULT 0,
    description TEXT,
    data_ai_hint TEXT,
    sizes TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample products data
INSERT INTO products (name, category, price, color, images, stock, description, sizes) VALUES
('Classic Black Tee', 'Drop Shoulder Tees', 899, 'Black', '{"https://example.com/tee1.jpg"}', 50, 'Comfortable cotton drop shoulder tee', '{"S","M","L","XL"}'),
('Navy Hoodie', 'Hoodies', 1599, 'Navy', '{"https://example.com/hoodie1.jpg"}', 25, 'Warm and cozy hoodie', '{"M","L","XL"}'),
('White Jersey', 'Jerseys', 1299, 'White', '{"https://example.com/jersey1.jpg"}', 30, 'Sports jersey with premium fabric', '{"S","M","L","XL","XXL"}');

-- Enable Row Level Security (if needed)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON products
FOR SELECT USING (true);
