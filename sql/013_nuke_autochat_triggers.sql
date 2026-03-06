-- 013_nuke_autochat_triggers.sql
-- TRUNCATE the autochat_triggers table to start from zero.
-- Date: 2026-03-06

TRUNCATE TABLE public.autochat_triggers RESTART IDENTITY;
