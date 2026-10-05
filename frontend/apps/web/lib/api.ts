import { createClient } from "@nairacloud/api-client";

let browser: ReturnType<typeof createClient> | null = null;

/** Browser singleton. Cookies are the session; never store JWTs. */
export function api(): ReturnType<typeof createClient> {
  if (!browser) {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
    browser = createClient(base);
  }
  return browser;
}
