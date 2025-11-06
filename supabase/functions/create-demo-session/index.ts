import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoSessionRequest {
  role: 'student' | 'teacher' | 'admin' | 'auditor';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating demo session...');

    const { role } = await req.json() as DemoSessionRequest;

    if (!['student', 'teacher', 'admin', 'auditor'].includes(role)) {
      throw new Error('Invalid role specified');
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Generate temporary demo account email
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const demoEmail = `demo-${role}-${timestamp}-${randomSuffix}@talentcloud.demo`;
    const demoPassword = `Demo${timestamp}${randomSuffix}!`;

    console.log(`Creating temporary demo account: ${demoEmail}`);

    // Create the demo user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        full_name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        is_demo_account: true,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }

    if (!userData.user) {
      throw new Error('User creation failed - no user data returned');
    }

    console.log(`User created successfully: ${userData.user.id}`);

    // Assign role to the user
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: role
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      // Clean up the user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      throw roleError;
    }

    console.log(`Role ${role} assigned successfully`);

    // Sign in as the demo user to get session
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (signInError) {
      console.error('Error signing in:', signInError);
      throw signInError;
    }

    console.log('Demo session created successfully');

    // Return session data
    return new Response(
      JSON.stringify({
        success: true,
        session: signInData.session,
        user: signInData.user,
        message: `Demo ${role} session created. This account will expire in 2 hours.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-demo-session:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
