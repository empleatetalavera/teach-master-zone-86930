-- Remove overloaded legacy function to avoid PostgREST RPC ambiguity
-- Keep only the 2-parameter version with optional center slug.
DROP FUNCTION IF EXISTS public.get_email_by_username(text);