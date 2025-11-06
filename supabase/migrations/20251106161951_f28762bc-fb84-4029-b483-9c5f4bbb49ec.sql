-- Create invoice templates table
CREATE TABLE public.invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  training_center_id UUID REFERENCES public.training_centers(id) ON DELETE CASCADE,
  template_data JSONB NOT NULL DEFAULT '{}',
  header_text TEXT,
  footer_text TEXT,
  logo_url TEXT,
  show_logo BOOLEAN DEFAULT true,
  show_qr_code BOOLEAN DEFAULT true,
  color_scheme JSONB DEFAULT '{"primary": "#10b981", "secondary": "#059669"}'::jsonb,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment history table
CREATE TABLE public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  training_center_id UUID NOT NULL REFERENCES public.training_centers(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  transaction_reference VARCHAR(100),
  notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tax configuration table
CREATE TABLE public.tax_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  tax_type VARCHAR(50) NOT NULL, -- 'vat', 'retention', 'other'
  rate NUMERIC(5, 2) NOT NULL,
  applies_to VARCHAR(50) NOT NULL DEFAULT 'all', -- 'all', 'specific_centers', 'specific_licenses'
  is_inclusive BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  training_center_id UUID REFERENCES public.training_centers(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoice_templates
CREATE POLICY "Admins can manage invoice templates"
ON public.invoice_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for payment_history
CREATE POLICY "Admins can manage payment history"
ON public.payment_history
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for tax_configurations
CREATE POLICY "Admins can manage tax configurations"
ON public.tax_configurations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view active tax configurations"
ON public.tax_configurations
FOR SELECT
USING (is_active = true);

-- Add triggers for updated_at
CREATE TRIGGER update_invoice_templates_updated_at
BEFORE UPDATE ON public.invoice_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_configurations_updated_at
BEFORE UPDATE ON public.tax_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();