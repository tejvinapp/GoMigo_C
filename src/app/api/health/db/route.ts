import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Lightweight query to test connection
    const { error } = await supabase
      .from('feature_flags')
      .select('flag_name')
      .limit(1)

    if (error) throw error

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      responseTimeMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: 'Database connection failed',
      responseTimeMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    }, { status: 503 })
  }
}
