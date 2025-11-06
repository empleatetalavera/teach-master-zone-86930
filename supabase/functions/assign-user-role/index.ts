import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RoleAssignmentRequest {
  user_id: string;
  role: 'admin' | 'teacher' | 'student' | 'inspector' | 'auditor';
  action?: 'assign' | 'remove';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      throw new Error('Authentication required');
    }

    console.log(`Role assignment request from user: ${user.id}`);

    // Check if the caller has admin role
    const { data: callerRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !callerRole || callerRole.role !== 'admin') {
      console.error('Authorization failed - user is not admin:', user.id);
      throw new Error('Unauthorized: Admin role required');
    }

    console.log('Admin authorization verified');

    // Parse request body
    const { user_id, role, action = 'assign' } = await req.json() as RoleAssignmentRequest;

    // Validate input
    if (!user_id) {
      throw new Error('user_id is required');
    }

    if (!role) {
      throw new Error('role is required');
    }

    const validRoles = ['admin', 'teacher', 'student', 'inspector', 'auditor'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Prevent self-demotion from admin role
    if (user_id === user.id && action === 'remove' && role === 'admin') {
      throw new Error('Cannot remove your own admin role');
    }

    // Initialize admin client for database operations
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

    // Verify target user exists
    const { data: targetUser, error: targetUserError } = await supabaseAdmin.auth.admin.getUserById(user_id);
    
    if (targetUserError || !targetUser) {
      console.error('Target user not found:', user_id);
      throw new Error('User not found');
    }

    console.log(`Processing ${action} for role ${role} to user ${user_id}`);

    if (action === 'remove') {
      // Remove the role
      const { error: deleteError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)
        .eq('role', role);

      if (deleteError) {
        console.error('Error removing role:', deleteError);
        throw new Error(`Failed to remove role: ${deleteError.message}`);
      }

      console.log(`Successfully removed role ${role} from user ${user_id}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Role ${role} removed from user`,
          user_id,
          role,
          action: 'removed',
          performed_by: user.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      // Assign the role (upsert to handle existing roles)
      const { error: upsertError } = await supabaseAdmin
        .from('user_roles')
        .upsert(
          {
            user_id,
            role,
          },
          {
            onConflict: 'user_id,role',
          }
        );

      if (upsertError) {
        console.error('Error assigning role:', upsertError);
        throw new Error(`Failed to assign role: ${upsertError.message}`);
      }

      console.log(`Successfully assigned role ${role} to user ${user_id}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Role ${role} assigned to user`,
          user_id,
          role,
          action: 'assigned',
          performed_by: user.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

  } catch (error) {
    console.error('Error in assign-user-role function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = errorMessage.includes('Unauthorized') || errorMessage.includes('Authentication') ? 403 : 400;

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    );
  }
});
