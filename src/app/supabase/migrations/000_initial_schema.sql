-- Initial Database Schema
-- Creates users table and basic structure

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can view own data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update own data" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  emotions JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for journal entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, entry_date);

-- Enable Row Level Security for journal entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policies for journal entries
CREATE POLICY "Users can view own journal entries" 
  ON journal_entries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" 
  ON journal_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" 
  ON journal_entries FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" 
  ON journal_entries FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at 
  BEFORE UPDATE ON journal_entries 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'User accounts with subscription information';
COMMENT ON TABLE journal_entries IS 'Daily emotional journal entries';
