import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the requester is admin@voltscout.com
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    if (user.email !== 'admin@voltscout.com') {
      throw new Error('Only admin@voltscout.com can perform user management operations');
    }

    const body = await req.json();
    const { action, userId, email, password, full_name, phone, department, role, permissions } = body;

    console.log(`User management action: ${action}`);

    switch (action) {
      case 'create-user':
        try {
          // Check if user already exists
          const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
          const userExists = existingUser?.users.some(u => u.email === email);
          
          if (userExists) {
            throw new Error(`User with email ${email} already exists`);
          }

          // Create auth user without email verification
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
              full_name
            }
          });

          if (authError) {
            throw authError;
          }

          // Wait a bit for the trigger to create the profile
          await new Promise(resolve => setTimeout(resolve, 500));

          // Update profile (trigger already created it)
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
              full_name,
              phone,
              department,
              role: 'analyst' // Default role from enum
            })
            .eq('id', authData.user.id);

          if (profileError) {
            console.error('Profile update error:', profileError);
            // Don't throw - profile might not exist yet due to trigger timing
          }

          // Add role
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: role as 'admin' | 'viewer' | 'moderator' | 'user'
            });

          if (roleError) {
            console.error('Role insert error:', roleError);
            throw roleError;
          }

          // Add permissions
          if (permissions && permissions.length > 0) {
            const permissionInserts = permissions.map((permission: string) => ({
              user_id: authData.user.id,
              permission
            }));

            const { error: permError } = await supabaseAdmin
              .from('user_permissions')
              .insert(permissionInserts);

            if (permError) {
              console.error('Permissions insert error:', permError);
              throw permError;
            }
          }

          console.log(`Successfully created user: ${email}`);
          
          return new Response(
            JSON.stringify({ success: true, user: authData.user }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Error creating user:', error);
          throw error;
        }

      case 'delete':
        // Delete user from auth (this will cascade to profiles and related tables)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (deleteError) {
          throw deleteError;
        }

        console.log(`Successfully deleted user: ${userId}`);
        
        return new Response(
          JSON.stringify({ success: true, message: 'User deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'reset-password':
        // Send password reset email
        const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: userId // Note: in this case we need to pass the user's email
        });

        if (resetError) {
          throw resetError;
        }

        // In production, you would send this link via email
        // For now, we'll just trigger the built-in Supabase password reset
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (userError || !userData.user) {
          throw new Error('User not found');
        }

        const { error: resetEmailError } = await supabaseAdmin.auth.resetPasswordForEmail(userData.user.email);
        if (resetEmailError) {
          throw resetEmailError;
        }

        console.log(`Password reset sent for user: ${userId}`);
        
        return new Response(
          JSON.stringify({ success: true, message: 'Password reset email sent' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in user-management function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
