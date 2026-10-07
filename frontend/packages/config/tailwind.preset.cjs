/** Single token source. Apps extend this preset. No raw hex in components. */

/**
 * Maps a CSS custom property from tokens.css to a Tailwind color that supports
 * opacity modifiers (`bg-accent/10`, `border-danger/40`).
 *
 * Without a modifier the class stays a plain `var(--x)` (works everywhere).
 * With a modifier it becomes `color-mix(...)` so tokens can stay hex/rgba in
 * tokens.css. A bare `"var(--x)"` string would make Tailwind silently drop
 * every `/NN` class.
 */
const token = (name) => ({ opacityValue }) =>
  opacityValue === undefined || String(opacityValue).startsWith("var(")
    ? `var(--${name})`
    : `color-mix(in srgb, var(--${name}) calc(${opacityValue} * 100%), transparent)`;

// Declared type: Tailwind v3's typings omit function colors, which its runtime supports.
/** @type {Partial<import("tailwindcss").Config>} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // ── NairaCloud palette ────────────────────────────────────────────
        bg: token("bg"),
        sidebar: token("sidebar"),
        topnav: token("topnav"),
        main: token("main"),
        surface: token("surface"),
        "surface-secondary": token("surface-secondary"),
        "surface-hover": token("surface-hover"),
        "nav-active": token("nav-active"),
        "nav-hover": token("nav-hover"),
        control: token("control"),
        "control-active": token("control-active"),
        segment: token("segment"),
        "segment-active": token("segment-active"),
        "ring-track": token("ring-track"),
        "mobile-nav": token("mobile-nav"),
        border: token("border"),
        "border-hover": token("border-hover"),
        "border-subtle": token("border-subtle"),
        "border-faint": token("border-faint"),
        "border-control": token("border-control"),
        "border-segment": token("border-segment"),
        "border-secondary": token("border-secondary"),
        text: token("text"),
        "text-secondary": token("text-secondary"),
        "text-muted": token("text-muted"),
        "text-disabled": token("text-disabled"),
        "text-axis": token("text-axis"),
        "text-hover": token("text-hover"),
        // Brand green. NOTE: shadcn uses `accent` for its subtle hover surface;
        // here it is the brand color. `npm run ui:add` rewrites shadcn's
        // `bg-accent` to `bg-surface-hover` (see packages/ui/README.md).
        accent: token("accent"),
        "accent-hover": token("accent-hover"),
        "accent-fg": token("accent-fg"),
        danger: token("danger"),
        warning: token("warning"),
        info: token("info"),
        success: token("success"),

        // ── shadcn/ui semantic roles (aliases defined in tokens.css) ─────
        background: token("background"),
        foreground: token("foreground"),
        card: { DEFAULT: token("card"), foreground: token("card-foreground") },
        popover: { DEFAULT: token("popover"), foreground: token("popover-foreground") },
        primary: { DEFAULT: token("primary"), foreground: token("primary-foreground") },
        secondary: { DEFAULT: token("secondary"), foreground: token("secondary-foreground") },
        muted: { DEFAULT: token("muted"), foreground: token("muted-foreground") },
        destructive: { DEFAULT: token("destructive"), foreground: token("destructive-foreground") },
        input: token("input"),
        ring: token("ring"),
      },
      // Defaults for bare `border` / `divide-*` / `ring` / `ring-offset-*`
      // (Tailwind's are light gray, blue and white — wrong on a dark UI).
      borderColor: { DEFAULT: "var(--border)" },
      ringColor: { DEFAULT: "var(--ring)" },
      ringOffsetColor: { DEFAULT: "var(--background)" },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-lg)",
        "mobile-nav": "var(--radius-mobile-nav)",
      },
      fontFamily: {
        // Apps must define --font-sans (web: IBM Plex; admin: aliased from Geist).
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  // animate-in / fade-in-0 / zoom-in-95 / slide-in-from-* used by shadcn primitives.
  plugins: [require("tailwindcss-animate")],
};
