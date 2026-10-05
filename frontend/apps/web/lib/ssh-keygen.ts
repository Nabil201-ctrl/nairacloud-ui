/** Browser-side ed25519 SSH keypair generation. Private key never leaves the device. */

export type GeneratedSshKey = {
  name: string;
  publicKey: string;
  privateKey: string;
  fingerprint: string;
  filename: string;
};

const ED25519_PKCS8_PREFIX = Uint8Array.from([
  0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20,
]);
const ED25519_SPKI_PREFIX = Uint8Array.from([
  0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00,
]);

function concat(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

function u32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n >>> 0);
  return b;
}

function sshString(data: Uint8Array | string): Uint8Array {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return concat(u32(bytes.length), bytes);
}

function toBase64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

function pemWrap(label: string, bytes: Uint8Array): string {
  const b64 = toBase64(bytes);
  const lines = b64.match(/.{1,70}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
}

function extractEd25519Seed(pkcs8: Uint8Array): Uint8Array {
  for (let i = 0; i <= pkcs8.length - ED25519_PKCS8_PREFIX.length - 32; i++) {
    let match = true;
    for (let j = 0; j < ED25519_PKCS8_PREFIX.length; j++) {
      if (pkcs8[i + j] !== ED25519_PKCS8_PREFIX[j]) {
        match = false;
        break;
      }
    }
    if (match) return pkcs8.slice(i + ED25519_PKCS8_PREFIX.length, i + ED25519_PKCS8_PREFIX.length + 32);
  }
  if (pkcs8.length >= 48) return pkcs8.slice(pkcs8.length - 32);
  throw new Error("Could not parse Ed25519 private key");
}

function extractEd25519Public(spki: Uint8Array): Uint8Array {
  for (let i = 0; i <= spki.length - ED25519_SPKI_PREFIX.length - 32; i++) {
    let match = true;
    for (let j = 0; j < ED25519_SPKI_PREFIX.length; j++) {
      if (spki[i + j] !== ED25519_SPKI_PREFIX[j]) {
        match = false;
        break;
      }
    }
    if (match) return spki.slice(i + ED25519_SPKI_PREFIX.length, i + ED25519_SPKI_PREFIX.length + 32);
  }
  if (spki.length >= 44) return spki.slice(spki.length - 32);
  throw new Error("Could not parse Ed25519 public key");
}

function encodeOpenSshPublic(publicKey: Uint8Array, comment: string): string {
  const blob = concat(sshString("ssh-ed25519"), sshString(publicKey));
  return `ssh-ed25519 ${toBase64(blob)} ${comment}`.trim();
}

function encodeOpenSshPrivate(seed: Uint8Array, publicKey: Uint8Array, comment: string): string {
  const pubBlob = concat(sshString("ssh-ed25519"), sshString(publicKey));
  const check = crypto.getRandomValues(new Uint8Array(4));
  const checkNum = new DataView(check.buffer).getUint32(0);
  const privKey = concat(seed, publicKey); // OpenSSH ed25519 private = seed || pubkey

  let privSection = concat(
    u32(checkNum),
    u32(checkNum),
    sshString("ssh-ed25519"),
    sshString(publicKey),
    sshString(privKey),
    sshString(comment),
  );

  const padLen = (8 - (privSection.length % 8)) % 8;
  if (padLen > 0) {
    const pad = new Uint8Array(padLen);
    for (let i = 0; i < padLen; i++) pad[i] = i + 1;
    privSection = concat(privSection, pad);
  }

  const body = concat(
    new TextEncoder().encode("openssh-key-v1\0"),
    sshString("none"),
    sshString("none"),
    sshString(new Uint8Array(0)),
    u32(1),
    sshString(pubBlob),
    sshString(privSection),
  );

  return pemWrap("OPENSSH PRIVATE KEY", body);
}

async function sha256Fingerprint(publicKeyLine: string): Promise<string> {
  const parts = publicKeyLine.trim().split(/\s+/);
  const b64 = parts[1] ?? "";
  const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", binary));
  return `SHA256:${toBase64(digest).replace(/=+$/, "")}`;
}

function sanitizeFilename(name: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "nairacloud";
  return `id_ed25519_${base}`;
}

export async function generateEd25519SshKey(name: string): Promise<GeneratedSshKey> {
  if (!crypto.subtle?.generateKey) {
    throw new Error("This browser cannot generate SSH keys. Paste a public key instead.");
  }

  const comment = name.trim() || "nairacloud";
  let keyPair: CryptoKeyPair;
  try {
    keyPair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  } catch {
    throw new Error("Ed25519 is not supported in this browser. Paste a public key instead, or use a recent Chrome, Firefox, or Safari.");
  }

  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keyPair.privateKey));
  const spki = new Uint8Array(await crypto.subtle.exportKey("spki", keyPair.publicKey));
  const seed = extractEd25519Seed(pkcs8);
  const publicRaw = extractEd25519Public(spki);
  const publicKey = encodeOpenSshPublic(publicRaw, comment);
  const privateKey = encodeOpenSshPrivate(seed, publicRaw, comment);
  const fingerprint = await sha256Fingerprint(publicKey);

  return {
    name: comment,
    publicKey,
    privateKey,
    fingerprint,
    filename: sanitizeFilename(comment),
  };
}

export function downloadTextFile(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: "application/x-pem-file" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
