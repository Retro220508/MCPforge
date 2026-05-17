-- Create generated_servers table
CREATE TABLE IF NOT EXISTS public.generated_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  generated_code TEXT NOT NULL,
  validation_score INTEGER DEFAULT 0,
  validation_result JSONB,
  environment_variables JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_generated_servers_user_id ON public.generated_servers(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_generated_servers_created_at ON public.generated_servers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.generated_servers ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own servers
CREATE POLICY "Users can view their own servers"
  ON public.generated_servers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own servers
CREATE POLICY "Users can create their own servers"
  ON public.generated_servers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own servers
CREATE POLICY "Users can update their own servers"
  ON public.generated_servers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own servers
CREATE POLICY "Users can delete their own servers"
  ON public.generated_servers
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_generated_servers_updated_at
  BEFORE UPDATE ON public.generated_servers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create test_invocations table for storing test results
CREATE TABLE IF NOT EXISTS public.test_invocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.generated_servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name VARCHAR(255) NOT NULL,
  input_params JSONB NOT NULL,
  output_result JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on server_id for faster queries
CREATE INDEX IF NOT EXISTS idx_test_invocations_server_id ON public.test_invocations(server_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_test_invocations_user_id ON public.test_invocations(user_id);

-- Enable Row Level Security
ALTER TABLE public.test_invocations ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own test invocations
CREATE POLICY "Users can view their own test invocations"
  ON public.test_invocations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own test invocations
CREATE POLICY "Users can create their own test invocations"
  ON public.test_invocations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE public.generated_servers IS 'Stores AI-generated MCP servers created by users';
COMMENT ON TABLE public.test_invocations IS 'Stores test execution results for generated MCP servers';
COMMENT ON COLUMN public.generated_servers.validation_score IS 'Code quality score from 0-100';
COMMENT ON COLUMN public.generated_servers.validation_result IS 'Full validation result including issues and dependencies';
COMMENT ON COLUMN public.generated_servers.environment_variables IS 'Array of environment variables needed by the server';
COMMENT ON COLUMN public.generated_servers.status IS 'Server status: draft, tested, deployed';

-- Made with Bob
