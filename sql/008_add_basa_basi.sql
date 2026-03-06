-- 008_add_basa_basi.sql
-- Add basa_basi JSONB column to store ice-breaker button config
-- Structure: { "chat": "...", "btn_a": "Mau", "btn_b": "Gak mau", "loop_reply": "Oke mau sekarang?" }

ALTER TABLE public.autochat_triggers
ADD COLUMN IF NOT EXISTS basa_basi JSONB DEFAULT NULL;

COMMENT ON COLUMN public.autochat_triggers.basa_basi IS 'Optional ice-breaker button config before follow check. Keys: chat, btn_a, btn_b, loop_reply';
