-- Create table for storing signed contracts
CREATE TABLE public.center_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_center_id UUID NOT NULL REFERENCES public.training_centers(id) ON DELETE CASCADE,
  signed_by UUID NOT NULL,
  signer_name TEXT NOT NULL,
  signer_dni TEXT NOT NULL,
  signer_position TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'general',
  contract_version TEXT NOT NULL DEFAULT '1.0',
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  signature_data TEXT, -- Base64 encoded signature image
  contract_content TEXT NOT NULL, -- Full contract HTML at time of signing
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(training_center_id, contract_type)
);

-- Enable RLS
ALTER TABLE public.center_contracts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Super admins can manage all contracts"
ON public.center_contracts
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Center admins can view their center contracts"
ON public.center_contracts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.training_center_id = center_contracts.training_center_id
  )
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Center admins can insert their center contract"
ON public.center_contracts
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.training_center_id = center_contracts.training_center_id
  )
  AND has_role(auth.uid(), 'admin'::app_role)
  AND signed_by = auth.uid()
);

-- Add index for faster lookups
CREATE INDEX idx_center_contracts_training_center ON public.center_contracts(training_center_id);
CREATE INDEX idx_center_contracts_signed_by ON public.center_contracts(signed_by);