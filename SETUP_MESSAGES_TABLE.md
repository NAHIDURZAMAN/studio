# Database Setup Instructions

## Step 1: Create Messages Table

Go to your Supabase Dashboard → SQL Editor and run this command:

```sql
-- Create messages table for contact form submissions
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_email ON messages(email);

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can view all messages" ON messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;
DROP POLICY IF EXISTS "Admin can update messages" ON messages;

-- RLS Policy: Only authenticated admins can view all messages
CREATE POLICY "Admin can view all messages" ON messages
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      'nahidurzaman1903@gmail.com',
      'sakifshahrear@gmail.com'
    )
  );

-- RLS Policy: Anyone can insert messages (for contact form)
CREATE POLICY "Anyone can insert messages" ON messages
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Only admins can update messages (change status, add notes)
CREATE POLICY "Admin can update messages" ON messages
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      'nahidurzaman1903@gmail.com',
      'sakifshahrear@gmail.com'
    )
  );

-- Create function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on every update
DROP TRIGGER IF EXISTS messages_updated_at ON messages;
CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();
```

## Step 2: Test the Setup

1. Go to your website: http://localhost:9002/contact
2. Fill out the contact form and submit
3. Check your Supabase Dashboard → Table Editor → messages table
4. Go to admin dashboard: http://localhost:9002/admin → Messages tab

## Troubleshooting

If you still get errors:

1. **Check Supabase URL and Anon Key**: Make sure your `.env.local` file has correct Supabase credentials
2. **Check Table Creation**: Verify the `messages` table exists in your Supabase dashboard
3. **Check RLS Policies**: Make sure the policies are created correctly
4. **Check Browser Console**: Look for more detailed error messages

## Quick Test Query

You can test if the table was created by running this in SQL Editor:

```sql
SELECT * FROM messages LIMIT 1;
```

If this returns without error, the table exists and is accessible.
