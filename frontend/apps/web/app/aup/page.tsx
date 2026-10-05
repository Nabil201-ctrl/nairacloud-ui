import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Acceptable Use Policy", description: "What you may and may not run on NairaCloud.", alternates: { canonical: "/aup" } };

export default function AupPage() {
  return (
    <LegalPage title="Acceptable use policy" updated="September 2026">
      <section><h2>Keep it legal and neighborly</h2><p>Infrastructure is shared. Anything that degrades it for others, breaks Nigerian law, or puts our network reputation at risk is out of bounds.</p></section>
      <section><h2>Prohibited</h2><ul><li>Spam and phishing. Outbound SMTP on port 25 is blocked at the network level on every instance.</li><li>Crypto-mining and other sustained max-CPU workloads. We automatically flag instances that pin ≥90% CPU for ten consecutive minutes.</li><li>Attacks of any kind: scanning, intrusion, DDoS, malware distribution.</li><li>Hosting content you do not have the rights to, or that is unlawful in Nigeria.</li></ul></section>
      <section><h2>Enforcement</h2><p>Automated detection flags suspicious instances for human review; no automated suspensions — a person decides every case. Confirmed abuse means immediate suspension of the instance or account and, for repeat or severe cases, account termination with data deleted after 14 days. Mistakes happen: reply to any suspension notice and an engineer reviews it.</p></section>
    </LegalPage>
  );
}
