-- ============================================
-- SECURITY FIXES: Error-Level Vulnerabilities
-- ============================================

-- Fix 1: Remove public PII exposure from profiles table
-- Drops the policy allowing unauthenticated access to profiles
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;

-- Fix 2: Restrict authenticated profile viewing to own profile only
-- This prevents any authenticated user from viewing all other users' PII
DROP POLICY IF EXISTS "Authenticated users can view authenticated profiles" ON public.profiles;

-- Recreate with proper restriction: users can only view profiles they have permission to see
-- (their own profile, or if they're admin/teacher via other policies)
CREATE POLICY "Users cannot browse other profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role)
);

-- Fix 3: Prevent database flooding via login attempts
-- Remove unrestricted insert policy
DROP POLICY IF EXISTS "Anyone can insert login attempts" ON public.login_attempts;

-- Note: Login tracking will need to be moved to an edge function with rate limiting
-- For now, we'll disable client-side inserts entirely to prevent abuse
-- The Auth.tsx file will need to be updated to remove the login tracking insert

-- Optional: If you still want client-side tracking (not recommended), use this instead:
-- CREATE POLICY "Rate-limited login tracking"
-- ON public.login_attempts FOR INSERT
-- WITH CHECK (auth.uid() IS NOT NULL);

-- Add index for performance on login attempts queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time 
ON public.login_attempts(email, attempt_time DESC);