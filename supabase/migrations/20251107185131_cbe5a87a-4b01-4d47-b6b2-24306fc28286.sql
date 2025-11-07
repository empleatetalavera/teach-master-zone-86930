-- Add super_admin role to the app_role enum
-- This role is for the platform administrators (TalentCloudSolution)
-- Regular 'admin' role is for training center administrators

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Add a comment to clarify the role hierarchy
COMMENT ON TYPE public.app_role IS 'User roles: super_admin (platform admin), admin (training center admin), teacher, student, auditor, inspector';