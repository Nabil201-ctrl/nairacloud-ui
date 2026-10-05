import type { Config } from "tailwindcss";

/** Mirrors frontend/packages/config/tailwind.preset.cjs with waitlist fonts. */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        sidebar: "var(--sidebar)",
        topnav: "var(--topnav)",
        main: "var(--main)",
        card: "var(--card)",
        surface: "var(--surface)",
        "surface-secondary": "var(--surface-secondary)",
        "surface-hover": "var(--surface-hover)",
        control: "var(--control)",
        border: "var(--border)",
        "border-hover": "var(--border-hover)",
        "border-subtle": "var(--border-subtle)",
        "border-faint": "var(--border-faint)",
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        muted: "var(--muted)",
        "text-disabled": "var(--text-disabled)",
        "text-hover": "var(--text-hover)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-fg": "var(--accent-fg)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        info: "var(--info)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        heroGlow: {
          "0%, 100%": { opacity: "0.15", transform: "translate(-50%, 0) scale(1)" },
          "50%": { opacity: "0.3", transform: "translate(-50%, 0) scale(1.05)" },
        },
        scan: {
          "0%": { opacity: "0", top: "0%" },
          "40%": { opacity: "1" },
          "100%": { opacity: "0", top: "100%" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease-out both",
        "hero-glow": "heroGlow 12s ease-in-out infinite",
        scan: "scan 5s linear infinite",
        "scan-slow": "scan 7s linear infinite 2s",
      },
    },
  },
  plugins: [],
};

export default config;
