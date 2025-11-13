import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update email for Grupo Arma admin
    const userId = '793e8199-d730-4263-a4be-6ec6acfeb173';
    const newEmail = 'grupoarmaformacion@gmail.com';
    const password = 'grupoarma2025';

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        email: newEmail,
        password: password,
        email_confirm: true
      }
    );

    if (error) throw error;

    console.log('Email and password updated for Grupo Arma admin');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email updated successfully',
        email: newEmail,
        password: password,
        loginUrl: 'https://teach-master-zone-86930.lovable.app/auth?center=grupoarma'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating email:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
