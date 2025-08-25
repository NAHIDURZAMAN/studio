# Database Update Guide - Adding Discount Columns

## 🗃️ How to Add Discount Columns to Your Supabase Database

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your X Style project

### Step 2: Access SQL Editor
1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New Query"** or use an existing query tab

### Step 3: Run the SQL Commands
Copy and paste these commands **one by one** and execute each:

```sql
-- Command 1: Add discount percentage column
ALTER TABLE products ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0;
```

```sql
-- Command 2: Add discount price column  
ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);
```

```sql
-- Command 3: Add validation constraint
ALTER TABLE products ADD CONSTRAINT products_discount_percentage_check 
CHECK (discount_percentage >= 0 AND discount_percentage <= 100);
```

```sql
-- Command 4: Update existing products
UPDATE products SET discount_percentage = 0 WHERE discount_percentage IS NULL;
```

### Step 4: Verify Installation
Run this command to check if columns were added:

```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('discount_percentage', 'discount_price');
```

You should see:
- `discount_percentage` | decimal | YES | 0
- `discount_price` | decimal | YES | (null)

### Step 5: Test Your Admin Panel
1. Go back to your admin panel: `http://localhost:9002/admin`
2. Try adding a new product with a discount
3. Try editing an existing product to add a discount
4. Check that discount badges appear on product cards

## ✅ What These Columns Do:

- **`discount_percentage`**: Stores the discount percentage (0-100%)
- **`discount_price`**: Stores the calculated discounted price
- **Constraint**: Ensures discount percentage is between 0-100%
- **Default**: Existing products will have 0% discount (no discount)

## 🎯 After Database Update:

Your discount system will be fully functional:
- Admin can set discounts by percentage OR direct price
- Discount badges appear on product images
- Original prices show crossed out with discounted prices highlighted
- Real-time updates work across admin and customer views

## 🔧 Troubleshooting:

If you get errors:
- Make sure you're connected to the correct database
- Run commands one at a time (don't run all together)
- Check that your products table exists first with: `SELECT * FROM products LIMIT 1;`
