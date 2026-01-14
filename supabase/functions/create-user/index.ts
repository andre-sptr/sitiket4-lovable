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

    const { email, password, name, role, phone, area } = await req.json()

    if (!email || !password || !name) {
      throw new Error('Email, Password, dan Nama wajib diisi')
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { name: name }
    })

    if (authError) throw authError

    const userId = authData.user.id

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        { 
          user_id: userId,
          name: name,
          email: email,
          phone: phone,
          area: area
        }
      ])

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw profileError
    }

    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert([
        { 
          user_id: userId, 
          role: role || 'guest' 
        }
      ])

    if (roleError) {
      throw roleError
    }

    return new Response(
      JSON.stringify({ message: 'User created successfully', user: authData.user }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})