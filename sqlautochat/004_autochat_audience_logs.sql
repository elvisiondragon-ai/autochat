-- 004_autochat_audience_logs.sql
-- Creates an audience/interaction log table to display in the "Audience" tab

CREATE TABLE public.autochat_audience_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- The autochat account owner
    ig_username TEXT NOT NULL,                                -- The follower/customer who interacted
    follow_status TEXT DEFAULT 'unknown',                     -- 'follower', 'non_follower', atau 'unknown'
    interaction_type TEXT NOT NULL,                           -- 'comment', 'dm', 'story_reply'
    auto_chat_status TEXT DEFAULT 'pending',                  -- 'sent', 'failed', 'pending'
    interaction_text TEXT,                                    -- The message or comment they sent (optional)
    trigger_id UUID REFERENCES public.ig_triggers(id) ON DELETE SET NULL, -- Which trigger caught this
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime / RLS Setup
ALTER TABLE public.autochat_audience_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audience logs" 
ON public.autochat_audience_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audience logs" 
ON public.autochat_audience_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audience logs" 
ON public.autochat_audience_logs FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audience logs" 
ON public.autochat_audience_logs FOR DELETE 
USING (auth.uid() = user_id);

-- Optional: Index on user_id for fast dashboard loading
CREATE INDEX idx_autochat_audience_logs_user_id ON public.autochat_audience_logs(user_id);
