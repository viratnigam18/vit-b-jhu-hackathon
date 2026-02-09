-- Table to store AI symptoms analysis and SOS alerts
CREATE TABLE IF NOT EXISTS emergency_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL, -- 'analysis' or 'sos'
    symptoms TEXT,
    condition TEXT,
    severity TEXT,
    recommendations JSONB,
    location JSONB,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE emergency_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see only their own logs
CREATE POLICY "Users can view own logs" ON emergency_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own logs
CREATE POLICY "Users can insert own logs" ON emergency_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
