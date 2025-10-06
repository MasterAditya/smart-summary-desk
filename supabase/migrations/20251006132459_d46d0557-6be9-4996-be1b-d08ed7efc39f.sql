-- Create analysis_history table
CREATE TABLE public.analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_text TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('text', 'pdf', 'url')),
  summary_short TEXT,
  summary_medium TEXT,
  summary_detailed TEXT,
  sentiment TEXT,
  sentiment_score DECIMAL(3, 2),
  keywords JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Public access for demo purposes (no auth required)
CREATE POLICY "Anyone can insert analysis"
  ON public.analysis_history
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view analysis"
  ON public.analysis_history
  FOR SELECT
  TO anon
  USING (true);

-- Index for faster queries
CREATE INDEX idx_analysis_created_at ON public.analysis_history(created_at DESC);