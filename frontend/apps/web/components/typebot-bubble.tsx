"use client";

import { useEffect } from "react";

const TYPEBOT_ID =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_TYPEBOT_ID) ||
  "nairacloud-support";

const TYPEBOT_API_HOST =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_TYPEBOT_API_HOST?.replace(/\/$/, "")) ||
  "https://bot.nairacloud.xyz";

type TypebotBubbleProps = {
  /** Prefill chat variables when the dashboard user is known */
  email?: string | null;
  name?: string | null;
};

declare global {
  interface Window {
    __nairacloudTypebotReady?: boolean;
  }
}

/**
 * Floating Typebot chat bubble for the customer dashboard.
 * Sits bottom-right; SupportFab shifts left when this is mounted.
 */
export function TypebotBubble({ email, name }: TypebotBubbleProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__nairacloudTypebotReady) return;
    window.__nairacloudTypebotReady = true;

    const prefilled: Record<string, string> = {};
    if (email) prefilled.Email = email;
    if (name) prefilled.Name = name;

    const script = document.createElement("script");
    script.type = "module";
    script.dataset.nairacloudTypebot = "1";
    script.textContent = `
      import Typebot from "https://cdn.jsdelivr.net/npm/@typebot.io/js@0.3/dist/web.js";
      Typebot.initBubble(${JSON.stringify({
        typebot: TYPEBOT_ID,
        apiHost: TYPEBOT_API_HOST,
        prefilledVariables: prefilled,
        theme: {
          button: {
            backgroundColor: "#ffffff",
            iconColor: "#0a0a0a",
          },
          chatWindow: {
            backgroundColor: "#0a0a0a",
            maxHeight: "560px",
          },
        },
      })});
    `;
    document.body.appendChild(script);

    return () => {
      // Bubble persists for the dashboard session; do not tear down on remount.
    };
  }, [email, name]);

  return null;
}
