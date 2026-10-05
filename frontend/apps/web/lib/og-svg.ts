export function ogSvg({ title = "NairaCloud", subtitle = "Naira-priced instances · Paystack checkout · servers online in minutes", accent = "everyone." }: { title?: string; subtitle?: string; accent?: string } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#0A0A0B"/>
<defs>
  <radialGradient id="g" cx="100%" cy="100%" r="60%">
    <stop offset="0%" stop-color="#00D9A0" stop-opacity="0.13"/>
    <stop offset="100%" stop-color="#00D9A0" stop-opacity="0"/>
  </radialGradient>
</defs>
<ellipse cx="1200" cy="630" rx="480" ry="420" fill="url(#g)"/>
<g transform="translate(84,110)">
  <rect width="48" height="48" rx="12" fill="#00D9A0"/>
  <path d="M15 34a5 5 0 0 1-.5-9.97 7 7 0 0 1 13.4-1.37A4.5 4.5 0 0 1 33 34H15z" fill="#0A0A0B"/>
  <path d="M20 37v-6M20 31v-4M24 34v-3M24 31v-2.5" stroke="#0A0A0B" stroke-width="1.5" stroke-linecap="round"/>
  <text x="62" y="28" fill="#F4F4F6" font-family="Geist, system-ui, -apple-system, Segoe UI, sans-serif" font-weight="700" font-size="18" letter-spacing="0.04">${title.toUpperCase()}</text>
</g>
<text x="84" y="320" fill="#F4F4F6" font-family="Geist, system-ui, -apple-system, Segoe UI, sans-serif" font-weight="700" font-size="56" letter-spacing="-0.02">Your cloud. Built for <tspan fill="#00D9A0">${accent}</tspan></text>
<text x="84" y="366" fill="#A1A1AA" font-family="Geist, system-ui, -apple-system, Segoe UI, sans-serif" font-size="22">${subtitle}</text>
</svg>`;
}