import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "NairaCloud terms of service — the legal agreement between you and NairaCloud.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="September 2026">
      <section>
        <h2>1. Agreement</h2>
        <p>
          These terms govern your use of the NairaCloud platform and all services offered at{" "}
          <a className="text-accent" href="https://nairacloud.xyz">nairacloud.xyz</a>. By registering an account or using
          any NairaCloud service you agree to them. We may update these terms from time to time; material changes are
          announced by email and become effective on the "last updated" date above.
        </p>
      </section>

      <section>
        <h2>2. Eligibility</h2>
        <p>
          You must be at least 18 years old and able to form a binding contract under Nigerian law. You register with a
          real email address and verify it before the dashboard unlocks. One person — one approved account.
        </p>
      </section>

      <section>
        <h2>3. The service</h2>
        <p>
          NairaCloud rents you virtual compute on shared infrastructure, billed in Nigerian naira. Each plan describes
          vCPU, RAM, and SSD allocation. Provisioning is best-effort within available capacity; when resources are not
          immediately available your order is acknowledged, placed on a waitlist, and provisioned as capacity frees up.
          You deploy your own operating systems and applications and manage them with root access.
        </p>
      </section>

      <section>
        <h2>4. Accounts and credentials</h2>
        <ul>
          <li>You are responsible for your accounts, SSH keys, API tokens, and anything done with them.</li>
          <li>Root passwords are shown once at creation — keep them safe; we cannot recover them afterwards.</li>
          <li>Tell support immediately if you suspect a credential leak.</li>
          <li>You must not create accounts to bypass quotas, abuse trials, or avoid suspension.</li>
        </ul>
      </section>

      <section>
        <h2>5. Billing and fees</h2>
        <p>
          Prices are listed in naira. Pay with a funded wallet or by card through Paystack. Every charge produces an
          invoice, available on your account. Paid plans are billed on a recurring basis until cancelled; the free plan
          is not billed.
        </p>
        <p>
          A failed payment starts a 3-day grace period with email warnings. If payment is still outstanding, instances
          are suspended, then deleted 14 days later along with their data. You can retrieve your data during the grace
          and suspension windows.
        </p>
      </section>

      <section>
        <h2>6. Refunds and support</h2>
        <p>
          If we cannot deliver a service you have paid for, we will credit your wallet or refund the charge through
          Paystack. Refund requests are reviewed case by case; refunds initiated through Paystack may take 2–10 business
          days to arrive. Requests go to{" "}
          <a className="text-accent" href="mailto:support@nairacloud.xyz">support@nairacloud.xyz</a>.
        </p>
      </section>

      <section>
        <h2>7. Your data</h2>
        <p>
          You own the data you store and the workloads you run on your instances. We monitor standard usage metrics
          (CPU, RAM, disk, network) to keep shared servers healthy, but we do not read, copy, or sell the contents of
          your instances. You are responsible for backing up anything you cannot afford to lose — instance disks are
          not replicated or backed up unless a plan says otherwise. Deleting an instance permanently removes its data.
        </p>
      </section>

      <section>
        <h2>8. Acceptable use</h2>
        <p>
          The <a className="text-accent" href="/aup">acceptable use policy</a> is part of these terms. Spam, phishing,
          crypto-mining and other sustained max-CPU workloads, attacks, and illegal content are detected automatically
          and reviewed by a person before action. Confirmed violations lead to suspension without the billing grace
          period, and repeated or severe abuse leads to account termination with data deleted after 14 days. A
          suspension notice can be appealed by replying to it.
        </p>
      </section>

      <section>
        <h2>9. Service levels</h2>
        <p>
          We aim for high availability and monitor our servers around the clock, but we do not guarantee uninterrupted or
          error-free service. We may perform maintenance that briefly restarts instances and reserve the right to move
          or redeploy instances to keep the platform healthy. Status is published on the{" "}
          <a className="text-accent" href="/status">status page</a>.
        </p>
      </section>

      <section>
        <h2>10. Liability</h2>
        <p>
          The service is provided "as is". To the maximum extent permitted by law, NairaCloud is not liable for loss of
          data, loss of profits, or indirect or consequential damages. Our total liability for any incident is limited
          to the fees you paid in the month it happened. Keep your own backups of anything you cannot lose.
        </p>
      </section>

      <section>
        <h2>11. Termination</h2>
        <p>
          You may stop using the service and delete your instances from the dashboard at any time. We may suspend or
          terminate accounts for breach of these terms, delinquent payment that survives the grace period, or conduct
          that threatens the platform or other customers.
        </p>
      </section>

      <section>
        <h2>12. Governing law</h2>
        <p>These terms are governed by the laws of the Federal Republic of Nigeria, and disputes are subject to the courts of Lagos.</p>
      </section>

      <section>
        <h2>13. Contact</h2>
        <p>
          Questions about your account, this agreement, or the platform:{" "}
          <a className="text-accent" href="mailto:support@nairacloud.xyz">support@nairacloud.xyz</a>.
        </p>
      </section>
    </LegalPage>
  );
}