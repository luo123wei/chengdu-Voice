import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';

/**
 * Server-side analytics event logger.
 * Inserts rows into analytics_events table (bypasses RLS via service role key).
 * All methods are fire-and-forget — failures are logged but never throw,
 * so analytics never breaks the user request path.
 *
 * Test mode: if the visitor's cookie `cv_test_mode` equals process.env.ADMIN_TEST_SECRET,
 * the event is flagged `is_test = true` so admin stats exclude it.
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

/**
 * Check if current request is in "test mode" (admin's own browser).
 * Presence of `cv_test_mode` cookie (any value) means test mode is on.
 * No secret required — admin toggles it from /admin dashboard.
 */
async function isTestMode(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const c = cookieStore.get('cv_test_mode');
    return !!c;
  } catch {
    return false;
  }
}

/**
 * Read the raw User-Agent header of the current request.
 * Defensive like isTestMode(): returns null if headers() is unavailable.
 */
async function getUserAgent(): Promise<string | null> {
  try {
    const h = await headers();
    return h.get('user-agent');
  } catch {
    return null;
  }
}

/**
 * Classify a User-Agent string into a known AI/search crawler name.
 * Case-insensitive substring match, FIRST MATCH WINS.
 * Returns null for human traffic.
 */
export function classifyBot(ua: string | null): string | null {
  if (!ua) return null;
  const s = ua.toLowerCase();
  // NOTE: OpenAI bots must be checked BEFORE "gptbot",
  // otherwise "OAI-SearchBot"/"ChatGPT-User" would collapse into GPTBot.
  if (s.includes('oai-searchbot')) return 'OAI-SearchBot';
  if (s.includes('chatgpt-user')) return 'ChatGPT-User';
  if (s.includes('gptbot')) return 'GPTBot';
  if (s.includes('perplexitybot')) return 'PerplexityBot';
  if (s.includes('perplexity-user')) return 'Perplexity-User';
  if (s.includes('claudebot')) return 'ClaudeBot';
  if (s.includes('claude-web')) return 'ClaudeBot';
  if (s.includes('anthropic-ai')) return 'ClaudeBot';
  if (s.includes('ccbot')) return 'CCBot';
  if (s.includes('bytespider')) return 'Bytespider';
  if (s.includes('meta-externalagent')) return 'Meta';
  if (s.includes('applebot')) return 'Applebot';
  if (s.includes('amazonbot')) return 'Amazonbot';
  if (s.includes('googlebot')) return 'Googlebot';
  if (s.includes('bingbot')) return 'Bingbot';
  if (s.includes('bot') || s.includes('crawler') || s.includes('spider')) return 'Other bot';
  return null;
}

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
    const testMode = await isTestMode();
    const ua = await getUserAgent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('analytics_events').insert({
      event_type: eventType,
      target_id: targetId,
      session_id: sessionId,
      is_test: testMode,
      user_agent: ua,
      bot_name: classifyBot(ua),
    });
  } catch (err) {
    console.error('[analytics] trackEvent failed:', err);
  }
}
