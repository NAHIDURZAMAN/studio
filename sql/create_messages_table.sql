-- Create messages table for contact form submissions
CREATE TABLE messages (
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

-- Create index for better performance
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_email ON messages(email);

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

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
CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();
