import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { strataName, unitCount, address, province, contactName, contactEmail, contactPhone } = body

    if (!strataName || !unitCount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing Supabase server environment variables' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await supabaseAdmin
      .from('strata_details')
      .insert([
        {
          strataName,
          unitCount,
          address,
          province,
          contactName,
          contactEmail,
          contactPhone,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Strata details insert error:', error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, strata: data }, { status: 200 })
  } catch (error) {
    console.error('Strata details route failed:', error)
    return NextResponse.json({ error: 'Unexpected error', details: String(error) }, { status: 500 })
  }
}
