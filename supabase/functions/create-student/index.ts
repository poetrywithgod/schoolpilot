import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const {
      school_id,
      first_name,
      last_name,
      middle_name,
      class_id,
      gender,
      date_of_birth,
      guardian_name,
      guardian_phone,
      reg_number,
      parent_linking_code,
      default_pin,
    } = await req.json()

    // Create auth user with reg number as email
    const email = `${reg_number.toLowerCase().replace(/\//g, '.')}@schoolpilot.internal`

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: default_pin,
      email_confirm: true,
    })

    if (authError) throw authError

    // Create student record
    const { data, error } = await supabaseAdmin
      .from('students')
      .insert({
        school_id,
        auth_id: authData.user.id,
        first_name,
        last_name,
        middle_name: middle_name || null,
        class_id,
        gender: gender || null,
        date_of_birth: date_of_birth || null,
        guardian_name: guardian_name || null,
        guardian_phone: guardian_phone || null,
        reg_number,
        parent_linking_code,
        is_active: true,
        profile_completed: false,
      })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})