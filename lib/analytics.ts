import { createClient } from '@supabase/supabase-js';

/**
 * Server-side analytics event logger.
 * Inserts rows into analytics_events table (bypasses RLS via service role key).
 * All methods are fire-and-forget — failures are logged but never throw,
 * so analytics never breaks the user request path.
 */

let _client: ReturnType<typeof createClient> | null = null;

function client() {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }
  _client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _client;
}

export type EventType =
  | 'blog_view'
  | 'product_view'
  | 'add_to_cart'
  | 'order_created';

export async function trackEvent(
  eventType: EventType,
  targetId: string | null,
  sessionId: string | null,
): Promise<void> {
  const supabase = client();
  if (!supabase) {
    return;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('analytics_events').insert({
      event_type: eventType,
      target_id: targetId,
      session_id: sessionId,
    });
  } catch (err) {
    console.error('[analytics] trackEvent failed:', err);
  }
}
