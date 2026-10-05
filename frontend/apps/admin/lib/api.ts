import { createClient } from "@nairacloud/api-client";

let browser: ReturnType<typeof createClient> | null = null;

export function api(): ReturnType<typeof createClient> {
  if (!browser) {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    browser = createClient(base);
  }
  return browser;
}