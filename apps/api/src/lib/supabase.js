import { createClient } from "@supabase/supabase-js";
import ws from "ws";

// Service-role client — server-side only, never exposed to the browser.
// This client never uses realtime subscriptions, but supabase-js's
// createClient() still eagerly constructs a RealtimeClient internally,
// which needs a WebSocket implementation. Node 20 has no native `WebSocket`
// global (that landed in Node 22), so we hand it the `ws` package explicitly
// to avoid a crash on startup.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  }
);
