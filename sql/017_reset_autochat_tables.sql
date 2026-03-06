-- 017_reset_autochat_tables.sql
-- COMPLETE RESET: Nuke autochat tables and rebuild from scratch, inserting specific admin token data
-- Requested via manual resolution
-- Date: 2026-03-06

BEGIN;

-- 1. DROP EXISTING TABLES CASCADE (to clean out all hidden/buggy data)
DROP TABLE IF EXISTS public.autochat_audience_logs CASCADE;
DROP TABLE IF EXISTS public.autochat_triggers CASCADE;
DROP TABLE IF EXISTS public.autochat_clients CASCADE;

-- 2. CREATE autochat_clients
CREATE TABLE public.autochat_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  phone_number TEXT,
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'paid')),
  meta_access_token TEXT,
  meta_page_id TEXT,
  meta_instagram_id TEXT,
  meta_app_id TEXT,
  meta_app_secret TEXT,
  trigger_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  ig_profile_pic_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for clients
ALTER TABLE public.autochat_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "autochat_clients: users view own row" ON public.autochat_clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "autochat_clients: users insert own row" ON public.autochat_clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "autochat_clients: users update own row" ON public.autochat_clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "autochat_clients: users delete own row" ON public.autochat_clients FOR DELETE USING (auth.uid() = user_id);

-- 3. CREATE autochat_triggers
CREATE TABLE public.autochat_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL DEFAULT '',
  is_any_word BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  trigger_source TEXT NULL,
  target_post TEXT NULL,
  
  -- Step 3 (Comment)
  comment_reply TEXT NULL,
  comment_reply_2 TEXT NULL,
  comment_reply_3 TEXT NULL,
  
  -- Step 4 (Opening DM)
  step4_text TEXT NULL,
  step4_button_type TEXT DEFAULT 'quick_reply',
  step4_button1_text TEXT NULL,
  step4_button1_url TEXT NULL,
  step4_button1_leads_to TEXT DEFAULT 'step5',
  step4_button2_text TEXT NULL,
  step4_button2_url TEXT NULL,
  step4_button2_leads_to TEXT DEFAULT 'step6',
  
  -- Step 5 (Follow-up DM)
  step5_text TEXT NULL,
  step5_button_type TEXT DEFAULT 'quick_reply',
  step5_button1_text TEXT NULL,
  step5_button1_url TEXT NULL,
  step5_button1_leads_to TEXT DEFAULT 'step6',
  step5_button2_text TEXT NULL,
  step5_button2_url TEXT NULL,
  step5_button2_leads_to TEXT DEFAULT 'repeat_step5',
  
  -- Step 6 (Ending)
  step6_text TEXT NULL,
  step6_button_text TEXT NULL,
  step6_button_url TEXT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for triggers
ALTER TABLE public.autochat_triggers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own triggers" ON public.autochat_triggers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own triggers" ON public.autochat_triggers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own triggers" ON public.autochat_triggers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own triggers" ON public.autochat_triggers FOR DELETE USING (auth.uid() = user_id);

-- 4. CREATE autochat_audience_logs
CREATE TABLE public.autochat_audience_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ig_username TEXT NOT NULL,
    follow_status TEXT DEFAULT 'unknown',
    interaction_type TEXT NOT NULL,
    auto_chat_status TEXT DEFAULT 'pending',
    interaction_text TEXT,
    trigger_id UUID REFERENCES public.autochat_triggers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for audience logs
ALTER TABLE public.autochat_audience_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own audience logs" ON public.autochat_audience_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own audience logs" ON public.autochat_audience_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own audience logs" ON public.autochat_audience_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own audience logs" ON public.autochat_audience_logs FOR DELETE USING (auth.uid() = user_id);

-- 5. SEED SPECIFIC ADMIN RECORD INTO autochat_clients
INSERT INTO public.autochat_clients (
  id,
  user_id,
  email,
  display_name,
  phone_number,
  status,
  meta_access_token,
  meta_page_id,
  meta_instagram_id,
  meta_app_id,
  meta_app_secret,
  trigger_list,
  ig_profile_pic_url,
  created_at,
  updated_at
) VALUES (
  '07248bec-3356-4af4-8ba0-ce8a16b56134',
  '482518ff-f744-493c-9a39-934b5e2735b3',
  'adminmeta@yahoo.com',
  'adminmeta',
  NULL,
  'free',
  'EAARivNfjDnEBQ84yph1bUmF6sJ4ZBLndJc0eJ4E8NSYHmZBbwcxvF3CMjowbVCMazJDLH6yNmbDs1D3E6xcR2OYHOzDgoTNSbbBfy6yPI8op28FL3oT0osiZC8HnpsZBw2d4tSZCD9ZAbUkPN68lMKIgkWTfklontZCVL41UZABYlI9HRZBUi7NZAYyGLUwkBxH8WYCKOZCLexpprycqZBzwjVzDgVeR9eVP9eHw4wmgT5jH',
  '518894044637696',
  '17841400529912607',
  NULL, -- meta_app_id can be updated later if needed
  NULL, -- meta_app_secret can be updated later if needed
  '[]'::jsonb,
  NULL,
  '2026-03-05 23:51:19.232555+07',
  '2026-03-06 20:08:28.004074+07'
) ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  meta_access_token = EXCLUDED.meta_access_token,
  meta_page_id = EXCLUDED.meta_page_id,
  meta_instagram_id = EXCLUDED.meta_instagram_id,
  meta_app_id = EXCLUDED.meta_app_id,
  meta_app_secret = EXCLUDED.meta_app_secret;

COMMIT;
