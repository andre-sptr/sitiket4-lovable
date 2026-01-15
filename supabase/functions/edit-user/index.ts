import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, email, password, name, role, phone, area } = await req.json()

    if (!userId) {
      throw new Error('User ID wajib diisi')
    }

    const authUpdates: any = {
      user_metadata: { name: name }
    }
    
    if (email) authUpdates.email = email
    
    if (password && password.length >= 6) {
      authUpdates.password = password
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      authUpdates
    )

    if (authError) throw authError

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        name: name,
        ...(email && { email: email }), 
        phone: phone,
        area: area,
        updated_at: new Date()
      })
      .eq('user_id', userId)

    if (profileError) throw profileError

    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    let roleError
    
    if (existingRole) {
      const { error } = await supabaseAdmin
        .from('user_roles')
        .update({ role: role })
        .eq('user_id', userId)
      roleError = error
    } else {
      const { error } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userId, role: role })
      roleError = error
    }

    if (roleError) throw roleError

    return new Response(
      JSON.stringify({ message: 'User updated successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})