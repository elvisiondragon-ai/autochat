-- ================================================
-- 007: Rename ig_triggers → autochat_triggers
-- Date: 2026-03-06
-- Purpose: Consolidate naming convention (autochat_*)
--          All code references already updated.
-- ================================================

ALTER TABLE public.ig_triggers RENAME TO autochat_triggers;

-- ================================================
