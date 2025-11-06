import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Invoice {
  id: string;
  invoice_number: string;
  training_center_id: string;
  due_date: string;
  total_amount: number;
  status: string;
  training_centers?: {
    name: string;
    contact_email: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting invoice status check...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    // Get all pending invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*, training_centers(name, contact_email)')
      .eq('status', 'pending')
      .order('due_date', { ascending: true });

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      throw invoicesError;
    }

    console.log(`Found ${invoices?.length || 0} pending invoices`);

    const notifications = [];
    const overdueInvoices = [];

    for (const invoice of invoices as Invoice[]) {
      const dueDate = new Date(invoice.due_date);
      const centerName = invoice.training_centers?.name || 'Centro de Formación';
      
      // Check if invoice is overdue
      if (dueDate < today && invoice.status === 'pending') {
        console.log(`Invoice ${invoice.invoice_number} is overdue`);
        
        // Mark invoice as overdue
        overdueInvoices.push(invoice.id);
        
        // Get admin users to notify
        const { data: adminRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        if (adminRoles) {
          for (const adminRole of adminRoles) {
            notifications.push({
              user_id: adminRole.user_id,
              type: 'invoice_overdue',
              priority: 'high',
              title: '⚠️ Factura Vencida',
              message: `La factura ${invoice.invoice_number} de ${centerName} está vencida. Importe: ${invoice.total_amount.toFixed(2)} €`,
              metadata: {
                invoice_id: invoice.id,
                invoice_number: invoice.invoice_number,
                training_center_id: invoice.training_center_id,
                amount: invoice.total_amount,
                due_date: invoice.due_date,
              },
            });
          }
        }
      }
      // Check if invoice is due in 3 days
      else if (dueDate >= today && dueDate <= threeDaysFromNow) {
        console.log(`Invoice ${invoice.invoice_number} is due in 3 days`);
        
        const { data: adminRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        if (adminRoles) {
          for (const adminRole of adminRoles) {
            notifications.push({
              user_id: adminRole.user_id,
              type: 'invoice_due_soon',
              priority: 'high',
              title: '📅 Factura por Vencer',
              message: `La factura ${invoice.invoice_number} de ${centerName} vence en menos de 3 días. Importe: ${invoice.total_amount.toFixed(2)} €`,
              metadata: {
                invoice_id: invoice.id,
                invoice_number: invoice.invoice_number,
                training_center_id: invoice.training_center_id,
                amount: invoice.total_amount,
                due_date: invoice.due_date,
              },
            });
          }
        }
      }
      // Check if invoice is due in 7 days
      else if (dueDate > threeDaysFromNow && dueDate <= sevenDaysFromNow) {
        console.log(`Invoice ${invoice.invoice_number} is due in 7 days`);
        
        const { data: adminRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        if (adminRoles) {
          for (const adminRole of adminRoles) {
            notifications.push({
              user_id: adminRole.user_id,
              type: 'invoice_reminder',
              priority: 'normal',
              title: '📋 Recordatorio de Factura',
              message: `La factura ${invoice.invoice_number} de ${centerName} vence el ${new Date(invoice.due_date).toLocaleDateString('es-ES')}. Importe: ${invoice.total_amount.toFixed(2)} €`,
              metadata: {
                invoice_id: invoice.id,
                invoice_number: invoice.invoice_number,
                training_center_id: invoice.training_center_id,
                amount: invoice.total_amount,
                due_date: invoice.due_date,
              },
            });
          }
        }
      }
    }

    // Update overdue invoices status
    if (overdueInvoices.length > 0) {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status: 'overdue' })
        .in('id', overdueInvoices);

      if (updateError) {
        console.error('Error updating overdue invoices:', updateError);
      } else {
        console.log(`Updated ${overdueInvoices.length} invoices to overdue status`);
      }
    }

    // Insert all notifications
    if (notifications.length > 0) {
      const { error: notificationsError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationsError) {
        console.error('Error creating notifications:', notificationsError);
        throw notificationsError;
      }

      console.log(`Created ${notifications.length} notifications`);
    }

    const summary = {
      total_invoices_checked: invoices?.length || 0,
      overdue_invoices: overdueInvoices.length,
      notifications_created: notifications.length,
      timestamp: new Date().toISOString(),
    };

    console.log('Invoice check completed:', summary);

    return new Response(
      JSON.stringify({
        success: true,
        summary,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in check-invoice-status function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
