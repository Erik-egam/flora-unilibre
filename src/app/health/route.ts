import { json } from '@/lib/http';
import { isSupabaseHealthy } from '@/lib/supabase';

export const runtime = 'nodejs';

/** Lets you confirm the configured Supabase project is reachable. */
export async function GET(): Promise<Response> {
  if (!(await isSupabaseHealthy())) {
    return json({ status: 'degraded', supabase: 'down' }, 503);
  }

  return json({ status: 'ok', supabase: 'up' });
}
