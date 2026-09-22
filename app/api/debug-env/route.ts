import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    nextPublicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) || 'MISSING',
    serviceKeyLen: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').length,
    anonKeyLen: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').length,
    NODE_ENV: process.env.NODE_ENV,
    allSupabaseVars: Object.keys(process.env).filter(k => k.toUpperCase().includes('SUPABASE')),
  };

  // Also try a direct supabase query
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(url, key);
      const { data, error, count } = await sb.from('blogs').select('id, slug', { count: 'exact' }).limit(3);
      Object.assign(env, {
        supabaseQueryOk: !error,
        supabaseCount: count,
        supabaseSample: data,
        supabaseError: error?.message || null,
      });
    }
  } catch (e: any) {
    env.supabaseException = e.message;
  }

  return NextResponse.json(env, { headers: { 'Cache-Control': 'no-store' } });
}
