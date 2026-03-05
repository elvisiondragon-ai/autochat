-- Create table for storing IG Triggers (Keywords and Replies)
CREATE TABLE public.ig_triggers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword TEXT NOT NULL,
    reply_message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note so user knows what this is for
COMMENT ON TABLE public.ig_triggers IS 'Stores keywords from IG comments that will trigger auto-DMs';

-- Create table for logging DMs sent (to prevent spamming the same user and track analitik)
CREATE TABLE public.ig_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ig_user_id TEXT NOT NULL,
    trigger_keyword TEXT NOT NULL,
    status TEXT NOT NULL, -- 'success', 'failed'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note so user knows what this is for
COMMENT ON TABLE public.ig_logs IS 'Logs of Auto DMs sent to Instagram users to prevent duplicate sends';

-- Setup Row Level Security (RLS) policies
-- Depending on how the ShopAuto app interacts with this, we might want to make it visible to authenticated users.
-- Assuming admin needs to view/edit this from frontend:
ALTER TABLE public.ig_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ig_logs ENABLE ROW LEVEL SECURITY;

-- Allow read/write for authenticated users (ShopAuto Admins)
CREATE POLICY "Allow authenticated users full access to ig_triggers" 
ON public.ig_triggers FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to ig_logs" 
ON public.ig_logs FOR ALL TO authenticated USING (true);

-- Allow Edge Function (service_role) to bypass RLS to read triggers and insert logs
-- (service_role inherently bypasses RLS, but stating it for clarity in case anon key is used mistakenly. 
-- Best practice: ALWAYS use service_role key inside the Webhook Edge Function).
