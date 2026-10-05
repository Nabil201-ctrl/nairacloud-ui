import type { ReactNode } from "react";
import { TerminalPreview } from "@nairacloud/ui";

export type DocSection = { 
  slug: string; 
  title: string; 
  description: string; 
  body: ReactNode;
  related?: string[];
  illustration?: string;
};

function Illustration({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="my-8 overflow-hidden rounded-xl border border-border bg-[#09090b]">
      <img
        src={src}
        alt={alt}
        className="mx-auto h-auto w-full max-h-[420px] object-contain"
        loading="lazy"
      />
    </div>
  );
}

const splash = (text: string) => `root@your-server:~# ` + text;

function TryIt({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="mt-10 rounded-md border border-accent/40 bg-accent/5 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Practical -- try it now</p>
      <h3 className="mt-2 text-lg font-bold tracking-tight text-text">{title ?? "Walk through it yourself"}</h3>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-text-muted">{children}</div>
    </div>
  );
}

export const DOCS: DocSection[] = [
  {
    slug: "getting-started",
    title: "Getting started",
    description: "The first ten minutes with NairaCloud -- accounts, plans, and your first server.",
    related: ["creating-an-instance", "ssh-access", "billing-subscriptions"],
    illustration: "/illustrations/getting-started.webp",
    body: (
      <>
        <Illustration src="/illustrations/getting-started.webp" alt="Getting started with NairaCloud - server deployment flow" />
        <h2>What NairaCloud is</h2>
        <p>NairaCloud rents you a little server in the cloud, priced in naira and paid through Paystack. No dollar card, no forex math, no surprise bank conversions -- what the pricing page says is what your card pays.</p>
        <ul>
          <li>Your server (we call it an <em>instance</em>) runs Ubuntu 22.04, Ubuntu 24.04, or Debian 12.</li>
          <li>Every instance is reachable on a public IP with root access over SSH. Instances share the node's public address, and each one gets its own SSH port, which never changes.</li>
          <li>You pay per server, per month, in naira. A plan change takes effect immediately; your next invoice uses the new price.</li>
        </ul>
        <h2>Join the waitlist</h2>
        <p>Early access is invite-only for now. Join the waitlist at join.nairacloud.xyz with your email. When your seat opens, you'll get an invite to get started and deploy.</p>
        <h2>Your first deploy</h2>
        <p>Go to the dashboard and pick <span className="font-mono">Deploy Instance</span>. You choose a plan, an operating system, an SSH key, and a name for your server. The whole flow is a handful of short steps and takes about a minute.</p>
        <ul>
          <li>Add your SSH key before you deploy -- the wizard can make one for you, or you can paste in your own.</li>
          <li>The FREE plan is for trying things out. Production work belongs on STARTER and up.</li>
          <li>You are charged the moment provisioning begins.</li>
        </ul>
        <TryIt title="Get a real website running in 5 minutes">
          <ol className="list-decimal space-y-1 pl-1">
            <li className="pl-2">Deploy your first instance (STARTER is fine).</li>
            <li className="pl-2">Open the instance, copy the one-line SSH command, and run it in your terminal.</li>
            <li className="pl-2">Paste these three commands, one at a time:</li>
          </ol>
          <TerminalPreview showLineNumbers lines={[
            "$ apt update && apt install -y nginx",
            "$ systemctl enable --now nginx",
            "$ hostname -I",
          ]} />
          <p>Open the IP shown at the end in your browser -- that is your own server, live on the internet.</p>
        </TryIt>
      </>
    ),
  },
  {
    slug: "account",
    title: "Your account",
    description: "Signing up, logging in, your session, API keys, SSH keys, and connecting to your server.",
    related: ["getting-started", "ssh-access", "api-reference"],
    body: (
      <>
        <h2>What your account is</h2>
        <p>Your account is your identity on NairaCloud. One account lets you provision instances on our cluster, manage them, view invoices, and pay in naira. Everything in the dashboard belongs to a single account, and you can invite team members under it later.</p>
        <h2>Signing up</h2>
        <p>On the Sign up page, enter your email and a password. A six-digit verification code arrives in your inbox. Enter that code and the account is ready -- email verification protects your account from unauthorized use.</p>
        <h2>Logging in</h2>
        <p>On the login page, enter the same email and password. You stay signed in -- the dashboard remembers you with a secure session cookie. If you are ever logged out, just sign in again with the same credentials.</p>
        <h2>Your session</h2>
        <ul>
          <li>The access cookie lasts about 15 minutes and refreshes automatically while you use the dashboard.</li>
          <li>If a request is denied because the session expired, the app retries with a refresh behind the scenes -- you will usually not notice anything.</li>
          <li>Sign out to end the session on that device. Your password, API keys, and settings stay safe.</li>
        </ul>
        <h2>API keys</h2>
        <p>Under <strong>API & Keys</strong> you can create a key for scripts and automation. It starts with <span className="font-mono">nc_live_</span> and is shown once at creation -- copy it to a password manager or CI secret, because it is not shown again. Keys currently have the same reach as the dashboard: provision, start, stop, rebuild, and delete instances.</p>
        <h2>SSH keys</h2>
        <p>Before you provision, add an SSH key under <strong>SSH Keys</strong>. You can auto-generate a keypair in your browser, or paste in an existing <span className="font-mono">.pub</span> key. We only store the public half; the private half never leaves your machine, so if you lose it there is no recovery -- download the private file once and keep it safe.</p>
        <h2>Logging in to your instance</h2>
        <p>After your instance is ready, open its page and copy the connect line -- it includes the exact port, which never changes for that server. Run it from the machine that holds the private key:</p>
        <TerminalPreview showLineNumbers lines={[
          "$ ssh root@102.89.13.22 -p 22000",
          "Welcome to Ubuntu 24.04 LTS (GNU/Linux 5.15.0-91 x86_64)",
        ]} />
        <p>That is how you log in to your instance. The browser console is on the way; today the way in is SSH.</p>
        <h2>Need help?</h2>
        <p>Open a support ticket from the dashboard. Support can help with billing, access, and anything in between.</p>
      </>
    ),
  },
  {
    slug: "creating-an-instance",
    title: "Creating an instance",
    description: "Plan, OS, key, name, review -- the deploy flow end to end.",
    related: ["getting-started", "ssh-access", "networking-firewall"],
    illustration: "/illustrations/creating-an-instance.webp",
    body: (
      <>
        <Illustration src="/illustrations/creating-an-instance.webp" alt="Creating an instance - 5 step deployment flow" />
        <h2>The five steps</h2>
        <ol>
          <li><strong>Plan</strong> -- STARTER for websites, BASIC for bots and backends, STANDARD for production, PRO for heavy loads.</li>
          <li><strong>Operating system</strong> -- Ubuntu 24.04, Ubuntu 22.04, or Debian 12.</li>
          <li><strong>SSH key</strong> -- pick an existing key, let us generate one, or paste your own. Keep the private half safe; we never store it.</li>
          <li><strong>Name</strong> -- lowercase letters, digits, and hyphens only, starting with a letter, 3-24 characters. This is how you'll spot it in the dashboard.</li>
          <li><strong>Review</strong> -- spec, price, and total due, shown one last time. Confirm and provisioning begins.</li>
        </ol>
        <h2>What provisioning means</h2>
        <p>We grab hardware, write the disk, boot the system, and open the network. The wizard plays a live checklist; most servers are reachable within a couple of minutes. You get:</p>
        <ul>
          <li>A public IP -- <span className="font-mono">102.89.x.x</span> -- reachable over SSH on the port shown in the dashboard.</li>
          <li>Root access with your key.</li>
          <li>SSD storage from 10GB on FREE up to 160GB on PRO, depending on plan.</li>
        </ul>
        <h2>Start, stop, rebuild, delete</h2>
        <ul>
          <li><strong>Stop</strong> -- turns the machine off cleanly. Your files are kept; billing continues until you delete the server.</li>
          <li><strong>Start</strong> -- turns it back on. Same port, same files.</li>
          <li><strong>Rebuild</strong> -- wipes the disk and installs the system again. Your <strong>connection stays the same</strong> -- same public address, same SSH port, same key.</li>
          <li><strong>Delete</strong> -- removes the server for good. You must type its name to confirm. A new server later gets a fresh disk and a new SSH port.</li>
        </ul>
        <TryIt title="Deploy a server you can actually use">
          <ol className="list-decimal space-y-1 pl-1">
            <li className="pl-2">Choose Ubuntu 24.04 and let the wizard generate an SSH key for you.</li>
            <li className="pl-2">Name it <span className="font-mono">my-site</span> and confirm. Watch the checklist tick off.</li>
            <li className="pl-2">When it says Ready, copy the SSH command from the instance page and run:</li>
          </ol>
          <TerminalPreview showLineNumbers lines={["$ ssh root@102.89.13.22 -p 22000", splash("whoami"), "root"]} />
          <p>You are now inside your own server. Type <span className="font-mono">exit</span> to close the connection -- it stays running without you.</p>
        </TryIt>
      </>
    ),
  },
  {
    slug: "ssh-access",
    title: "SSH access",
    description: "Keys, fingerprints, and the one-liner into your box.",
    related: ["getting-started", "creating-an-instance", "api-reference"],
    illustration: "/illustrations/networking-firewall.webp",
    body: (
      <>
        <Illustration src="/illustrations/networking-firewall.webp" alt="SSH access - key exchange and encrypted connection" />
        <h2>What SSH is</h2>
        <p>SSH is the safe way to get into your server from your laptop. Instead of a password, you use a <em>key</em> -- a pair of files: one public (yours to share, we keep it) and one private (never leaves your machine).</p>
        <h2>Adding an SSH key</h2>
        <p>Under <strong>SSH Keys</strong> in the dashboard, choose <strong>Auto-generate</strong> to create a brand-new keypair in your browser. Download the private key once -- we only store the public half. You can also paste in an existing public key (a file ending in <span className="font-mono">.pub</span>).</p>
        <TerminalPreview showLineNumbers lines={["# Optional: make your own key instead", "$ ssh-keygen -t ed25519 -C you@nairacloud", "$ cat ~/.ssh/id_ed25519.pub", splash("ssh-ed25519 AAAAC3NzaC1lZD... you@nairacloud")]} />
        <h2>Connecting</h2>
        <p>Open your instance's page and copy the connect line -- it includes the exact port. Run it from the machine holding the private key.</p>
        <TerminalPreview showLineNumbers lines={["$ ssh root@102.89.13.22 -p 22000", "Welcome to Ubuntu 24.04 LTS (GNU/Linux 5.15.0-91 x86_64)"]} />
        <h2>Common problems</h2>
        <ul>
          <li><strong>Permission denied</strong> -- your private key is missing or locked. Make sure you're running the connect line from the machine that holds it.</li>
          <li><strong>Connection refused</strong> -- two easy checks: the server is running, and you used the exact port from the dashboard.</li>
          <li><strong>Lost your private key?</strong> We never store private keys, so it can't be recovered. Delete the server and create a fresh one with a new key -- it gets a fresh disk and a new SSH port.</li>
        </ul>
        <h2>There is no browser console yet</h2>
        <p>The dashboard's console is on the way. Today the way in is SSH. If your network blocks direct connections, try a phone hotspot or a VPN.</p>
        <TryIt title="Connect for real, end to end">
          <ol className="list-decimal space-y-1 pl-1">
            <li className="pl-2">Auto-generate a key under <strong>SSH Keys</strong> and download the private file.</li>
            <li className="pl-2">Deploy an instance with that key.</li>
            <li className="pl-2">From the instance page, copy the SSH command and run it. On first connect, type <span className="font-mono">yes</span> when asked to trust the host.</li>
          </ol>
          <TerminalPreview showLineNumbers lines={["$ ssh root@102.89.13.22 -p 22000", "Welcome to Ubuntu 24.04 LTS (GNU/Linux 5.15.0-91 x86_64)", splash("uname -a")]} />
          <p>That welcome message means it worked. Now try <span className="font-mono">reboot</span> -- the machine restarts and your connection details stay the same.</p>
        </TryIt>
      </>
    ),
  },
  {
    slug: "networking-firewall",
    title: "Networking & firewall",
    description: "Your public IP, the ports we open, and pointing a domain at your server.",
    related: ["creating-an-instance", "ssh-access", "api-reference"],
    illustration: "/illustrations/networking-firewall.webp",
    body: (
      <>
        <Illustration src="/illustrations/networking-firewall.webp" alt="Networking and firewall - ports, DNS, and SSH tunnels" />
        <h2>Your public address</h2>
        <p>Think of your server's address on the internet. Every instance is reachable on the node's public IPv4 address, and each instance owns a unique SSH port on it. Your address and port stay the same across start, stop, and even rebuild. They only change when you delete the server and make a new one.</p>
        <h2>What's reachable</h2>
        <p>Your SSH port is always open to the world; that's how you connect. There is no firewall UI yet, so you can't open extra public ports from the dashboard -- a public port-mapping feature is on the roadmap. Until then, preview web apps locally with an SSH tunnel:</p>
        <TerminalPreview showLineNumbers lines={["$ ssh -N root@102.89.13.22 -p 22000 -L 8080:localhost:80", "# then open http://localhost:8080 in your browser"]} />
        <ul>
          <li>Port 25 (SMTP) is blocked on every plan at the network level -- for sending email at scale use <span className="font-mono">SendGrid</span>, <span className="font-mono">Postmark</span>, or <span className="font-mono">SES</span>.</li>
          <li>ICMP is allowed, so <span className="font-mono">ping</span> and traceroute work.</li>
          <li>IPv6 is on the roadmap; until then egress uses NAT, which keeps things simple.</li>
        </ul>
        <h2>Point a domain at your server</h2>
        <p>At your registrar, create an <strong>A record</strong> with your domain name and your server's public IPv4 address as the value. Changes usually apply within minutes to an hour.</p>
        <TryIt title="Put your domain on your server">
          <ol className="list-decimal space-y-1 pl-1">
            <li className="pl-2">Fetch your instance's public address and SSH port from its page in the dashboard.</li>
            <li className="pl-2">At your registrar, add an A record: name <span className="font-mono">example.com</span>, value <span className="font-mono">102.89.13.22</span>.</li>
          </ol>
          <TerminalPreview showLineNumbers lines={["$ ping example.com", "PING example.com (102.89.13.22) 56(84) bytes of data."]} />
          <p>Once it answers with your server's address, the internet can find it by name.</p>
        </TryIt>
      </>
    ),
  },
  {
    slug: "billing-subscriptions",
    title: "Billing & subscriptions",
    description: "Naira pricing, Paystack cards, mid-month plan changes, and the grace window.",
    related: ["getting-started", "api-reference"],
    illustration: "/illustrations/billing-subscriptions.webp",
    body: (
      <>
        <Illustration src="/illustrations/billing-subscriptions.webp" alt="Billing and subscriptions - plans, payment methods, and invoices" />
        <h2>How you're charged</h2>
        <ul>
          <li>Prices are per server, per month, in naira. Currency conversion is the card network's problem, never yours.</li>
          <li>You're charged when provisioning starts; the card on file is billed via Paystack, or funds are drawn from your wallet.</li>
          <li>Move to a bigger or smaller plan any time. The change applies right away and your next invoice uses the new price -- there's no mid-cycle proration.</li>
        </ul>
        <h2>Subscriptions</h2>
        <p>Billing - Subscriptions lists one subscription per server. Change plans there; cancelling switches billing off at the end of the paid period.</p>
        <h2>If a payment fails</h2>
        <p>You get a three-day grace window. A banner appears on the dashboard, you update your card, and your servers keep running. After the window, servers suspend; nothing is deleted for another fourteen days.</p>
        <h2>Invoices</h2>
        <p>Every charge produces a naira invoice under Billing - Invoices, downloadable as a page you can print or save as PDF from your browser.</p>
        <TryIt title="Follow a real billing cycle">
          <ol className="list-decimal space-y-1 pl-1">
            <li className="pl-2">Deploy a STARTER server (N3,500/mo) and watch the invoice arrive in your email.</li>
            <li className="pl-2">Ten days in, move up to BASIC (N7,000/mo). The change applies right away; the next invoice uses the new price. No partial refunds or charges -- the plan just changes at the next cycle.</li>
            <li className="pl-2">Delete the server and billing ends.</li>
          </ol>
          <TerminalPreview showLineNumbers language="text" title="invoice" lines={["Invoice NC-2026-00042", "STARTER -- my-site   N3,500.00", "Paid on 12 Jun 2026"]} />
          <p>Every step shows up in email and in Billing - Invoices, so you always know where your naira went.</p>
        </TryIt>
      </>
    ),
  },
  {
    slug: "api-reference",
    title: "API reference",
    description: "Script your cloud -- deploy, start, stop, rebuild, delete, all over HTTPS.",
    related: ["ssh-access", "networking-firewall", "billing-subscriptions"],
    illustration: "/illustrations/api-reference.webp",
    body: (
      <>
        <Illustration src="/illustrations/api-reference.webp" alt="API reference - client, gateway, and infrastructure" />
        <h2>Keys</h2>
        <p>Create API keys under <em>API & Keys</em>. The key is shown once, right at creation, and starts with <span className="font-mono">nc_live_</span> so you can spot it in logs. Keys currently have the same reach as the dashboard; scoped keys are on the roadmap.</p>
        <h2>Sending a request</h2>
        <p>Every endpoint lives under <span className="font-mono">https://api.nairacloud.xyz</span>. Send your key in the <span className="font-mono">Authorization</span> header:</p>
        <TerminalPreview showLineNumbers language="bash" lines={['$ curl -s https://api.nairacloud.xyz/v1/instances \\', '    -H "Authorization: Bearer nc_live_..."']} />
        <p>Every response is JSON. Successes have <span className="font-mono">success: true</span> and <span className="font-mono">data</span>. Errors are objects with <span className="font-mono">success: false</span>, a machine-readable <span className="font-mono">code</span> and a plain-English <span className="font-mono">message</span> inside <span className="font-mono">error</span>, plus a <span className="font-mono">requestId</span> you can quote to support.</p>
        <h2>Lifecycle</h2>
        <ul>
          <li><span className="font-mono">POST /v1/instances</span> -- deploy (plan, os, key, name).</li>
          <li><span className="font-mono">GET /v1/instances</span> -- list. Each server: id, name, status, ip, sshPort, plan.</li>
          <li><span className="font-mono">POST /v1/instances/:id/start | /stop | /rebuild</span> -- lifecycle. Rebuild keeps the same address and port.</li>
          <li><span className="font-mono">DELETE /v1/instances/:id</span> -- delete after confirmation.</li>
        </ul>
        <TryIt title="Drive a server from start to finish with curl">
          <ol className="list-decimal space-y-1 pl-1">
            <li className="pl-2">Make a key under API & Keys, then deploy:</li>
          </ol>
          <TerminalPreview showLineNumbers lines={['$ curl -s https://api.nairacloud.xyz/v1/instances \\', '    -H "Authorization: Bearer nc_live_..." \\', '    -H "Content-Type: application/json" \\', '    -d \'{"plan":"starter","os":"ubuntu-24.04","sshKeyId":"key_...","hostname":"api-bot"}\'']} />
          <ol className="list-decimal space-y-1 pl-1" start={2}>
            <li className="pl-2">List your servers, reboot one, rebuild it (same IP!), then delete it:</li>
          </ol>
          <TerminalPreview showLineNumbers lines={['$ curl -s -X POST https://api.nairacloud.xyz/v1/instances/<id>/rebuild \\', '    -H "Authorization: Bearer nc_live_..." \\', '    -d \'{"image":"ubuntu-24.04"}\'', '$ curl -s -X DELETE https://api.nairacloud.xyz/v1/instances/<id> \\', '    -H "Authorization: Bearer nc_live_..."']} />
          <p>That is the whole loop -- deploy, use, destroy -- all scriptable.</p>
        </TryIt>
      </>
    ),
  },
  {
    slug: "docker-caddy",
    title: "Docker & Caddy - reverse proxy superpowers",
    description: "Run multiple apps on one server with Docker Compose, Caddy auto-HTTPS, and structured error handling.",
    related: ["creating-an-instance", "networking-firewall", "ssh-access"],
    illustration: "/illustrations/docker-caddy.webp",
    body: (
      <>
        <Illustration src="/illustrations/docker-caddy.webp" alt="Docker and Caddy - containerized services with reverse proxy" />
        <h2>Why Docker + Caddy</h2>
        <p>Docker runs isolated services. Caddy handles TLS automatically.</p>
        <h2>Project structure</h2>
        <TerminalPreview showLineNumbers language="text" title="paths" lines={[
          "~/apps/api/docker-compose.yml",
          "~/apps/api/Caddyfile",
        ]} />
        <TryIt title="Deploy a Go API with Caddy">
          <ol className="list-decimal space-y-1 pl-1">
            <li className="pl-2">mkdir -p ~/apps/hello && cd ~/apps/hello</li>
            <li className="pl-2">Create docker-compose.yml and Caddyfile</li>
            <li className="pl-2">Run: docker compose up -d --build</li>
            <li className="pl-2">Add A record for api.yourdomain.xyz to your server IP</li>
          </ol>
        </TryIt>
      </>
    ),
  },
  {
    slug: "vps-monitoring",
    title: "VPS monitoring - htop, logs, and staying ahead of trouble",
    description: "Keep your server healthy with htop, journalctl, Docker stats, and simple alerting.",
    related: ["ssh-access", "docker-caddy", "creating-an-instance"],
    illustration: "/illustrations/instant-boot.webp",
    body: (
      <>
        <Illustration src="/illustrations/instant-boot.webp" alt="VPS monitoring - htop, logs, docker stats, and alerts" />
        <h2>Check system health</h2>
        <ol>
          <li>Run htop to see CPU and memory</li>
          <li>Run df -h to check disk space</li>
          <li>Run docker ps to verify containers</li>
        </ol>
        <TryIt title="Quick health check">
          <ol className="list-decimal space-y-1 pl-1">
            <li className="pl-2">apt update && apt install -y htop</li>
            <li className="pl-2">Run htop</li>
          </ol>
        </TryIt>
      </>
    ),
  },
];
