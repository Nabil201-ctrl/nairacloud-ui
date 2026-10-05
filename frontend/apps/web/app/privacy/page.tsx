import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How NairaCloud collects, uses, stores, and protects your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="September 2026">
      <section>
        <h2>Who we are</h2>
        <p>
          NairaCloud is a cloud infrastructure provider operating compute servers for customers in Nigeria, billing in naira
          through Paystack. This policy explains what we collect, why we collect it, and what you can do about it.
          Questions or requests: <a className="text-accent" href="mailto:support@nairacloud.xyz">support@nairacloud.xyz</a>.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li><strong className="text-text">Account details</strong> — email address, name, and a hashed password. You verify your email with a one-time code before the dashboard unlocks.</li>
          <li><strong className="text-text">Credentials</strong> — SSH public keys and API tokens you choose to upload. Root passwords are stored encrypted and shown to you once at creation; they are not recoverable afterwards.</li>
          <li><strong className="text-text">Billing records</strong> — wallet balance and ledger, Paystack payment references, and invoices. Full card numbers never touch our servers; Paystack stores the token on their side.</li>
          <li><strong className="text-text">Operational data</strong> — instance specifications (plan, hostname, image), public IP and SSH port, usage metrics (CPU, RAM, disk, network), support tickets, and audit log entries.</li>
          <li><strong className="text-text">Connection data</strong> — IP addresses and user-agent details used for authentication, rate limiting, and abuse detection.</li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To operate the service: create, manage, and monitor your instances and keep shared servers healthy.</li>
          <li>To bill you accurately and issue invoices for every charge.</li>
          <li>To secure the platform: detect abuse, spam, intrusion attempts, and fraudulent payments.</li>
          <li>To communicate with you about your order, instance status, billing, and — only if you opt in — product news.</li>
          <li>To meet legal and accounting obligations in Nigeria.</li>
        </ul>
        <p>
          We do not read your instance disks or inspect your deployed workloads. The files and applications on your
          instances are yours.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Sessions are managed with three cookies — <span className="font-mono text-sm">nc_access</span>,{" "}
          <span className="font-mono text-sm">nc_refresh</span>, and <span className="font-mono text-sm">nc_csrf</span>.
          There are no advertising trackers and no third-party analytics cookies.
        </p>
      </section>

      <section>
        <h2>Payments</h2>
        <p>
          Payments are processed by Paystack. When you pay, only Paystack sees your card details; we receive a
          transaction reference and, for saved cards, a tokenized authorization code with the last four digits and card
          type. Paystack's own privacy policy governs their handling of that data.
        </p>
      </section>

      <section>
        <h2>Where data is stored</h2>
        <p>
          Your instances run on compute servers operated by NairaCloud. Supporting services (database hosting, queues,
          and email delivery) rely on trusted providers, and payment data is handled by Paystack. No matter where a
          provider sits, your data is only processed to run the service and never sold, rented, or licensed.
        </p>
      </section>

      <section>
        <h2>Retention</h2>
        <ul>
          <li>Account and instance data are kept while your account is active.</li>
          <li>Invoices and wallet ledger entries are retained to satisfy accounting requirements.</li>
          <li>Instance data is permanently removed when an instance is deleted.</li>
          <li>Suspended instances awaiting deletion are removed 14 days after the final decision, along with their data.</li>
          <li>Security logs are retained for a limited period to investigate incidents.</li>
        </ul>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          We apply industry-standard safeguards to keep your data safe, including encryption and access restricted to
          staff who need it to run the service. We deliberately keep the details internal: publishing our controls would
          make every customer's instances a weaker target, not a safer one.
        </p>
      </section>

      <section>
        <h2>Disclosure</h2>
        <p>
          We share your data only: to process payments with Paystack; to comply with Nigerian law or a valid legal
          request; to prevent fraud, abuse, or threats to the network; or with your consent. We never sell your data.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <ul>
          <li><strong className="text-text">Access and export</strong> — request a copy of the data we hold about you.</li>
          <li><strong className="text-text">Correction</strong> — update your account details from the dashboard or by emailing support.</li>
          <li><strong className="text-text">Deletion</strong> — delete your account and instances from the dashboard or on request.</li>
          <li><strong className="text-text">Objection and withdrawal</strong> — decline marketing and adjust notification preferences at any time.</li>
        </ul>
        <p>
          We respond to requests within 30 days. To exercise any of these rights, contact{" "}
          <a className="text-accent" href="mailto:support@nairacloud.xyz">support@nairacloud.xyz</a>.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>NairaCloud is intended for people 18 and older. We do not knowingly collect data from children.</p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          We may update this policy as the service evolves. Material changes are announced by email and reflected in the
          "last updated" date above. Continued use after changes means you accept the revised policy.
        </p>
      </section>
    </LegalPage>
  );
}