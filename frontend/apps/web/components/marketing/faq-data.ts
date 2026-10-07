/** Single source for FAQ answers shown on / and /pricing. Keep them factual. */
export const FAQ_ITEMS = [
  { q: "Why might a plan show as limited?", a: "We run a two-server cloud for now. Larger plans take a bigger slice of that capacity, so a plan may temporarily show as limited when hardware is full. Seats reopen as servers free up." },
  { q: "What happens if I exceed my plan?", a: "Nothing silently. Failed payments get a 3-day grace period, and plan changes apply right away with the new price on the next invoice." },
  { q: "Can I point a domain at my server?", a: "Yes. Create an A record to the node public IP on your instance page. Preview apps with an SSH tunnel any time. For public HTTP/HTTPS on ports 80 and 443, open a support ticket and we publish those ports on the node — then Caddy or nginx inside your instance can serve your domain with Let's Encrypt." },
  { q: "Do you offer backups?", a: "Not yet — automated snapshots are on the roadmap. Today the reliable way to keep your data is your own: back files up with tar or rsync over SSH. That also survives a rebuild, whereas a rebuild alone wipes the disk." },
  { q: "What payment methods do you accept?", a: "Anything Paystack supports: Nigerian cards and bank transfers. Every charge is in naira with an invoice to match." },
];
