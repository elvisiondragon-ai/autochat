ALTER TABLE autochat_triggers
  ADD COLUMN IF NOT EXISTS step4_button1_leads_to TEXT DEFAULT 'step5',
  ADD COLUMN IF NOT EXISTS step4_button2_leads_to TEXT DEFAULT 'step6',
  ADD COLUMN IF NOT EXISTS step5_button1_leads_to TEXT DEFAULT 'step6',
  ADD COLUMN IF NOT EXISTS step5_button2_leads_to TEXT DEFAULT 'repeat_step5';
