-- Add super_admin access to profiles table
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add super_admin access to user_roles table
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Also ensure super_admin can view all invoices
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;
CREATE POLICY "Admins and super_admins can manage all invoices"
ON public.invoices
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Ensure super_admin can manage licenses
DROP POLICY IF EXISTS "Admins can manage licenses" ON public.licenses;
CREATE POLICY "Admins and super_admins can manage licenses"
ON public.licenses
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Ensure super_admin can manage content_orders
DROP POLICY IF EXISTS "Admins can manage all content orders" ON public.content_orders;
CREATE POLICY "Admins and super_admins can manage all content orders"
ON public.content_orders
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Super admin access to payment_history
DROP POLICY IF EXISTS "Admins can manage payment history" ON public.payment_history;
CREATE POLICY "Admins and super_admins can manage payment history"
ON public.payment_history
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Super admin access to invoice_templates
DROP POLICY IF EXISTS "Admins can manage invoice templates" ON public.invoice_templates;
CREATE POLICY "Admins and super_admins can manage invoice templates"
ON public.invoice_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));