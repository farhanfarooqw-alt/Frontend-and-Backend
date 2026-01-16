-- Create the submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable Row Level Security for testing
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;