import { z } from "zod";

// Zod's JIT path probes `new Function("")`; under a strict CSP that probe
// still logs a securitypolicyviolation even though the throw is caught.
z.config({ jitless: true });

// Mirrors backend DTOs (SignupDto/LoginDto/VerifyEmailDto/...). Keep in sync.
export const email = z.string().email("Enter a valid email address");
export const password = z
  .string()
  .min(8, "Minimum 8 characters")
  .max(128, "Maximum 128 characters")
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).+$/,
    "Must include a letter, a number and a symbol",
  );

export const signupSchema = z
  .object({ email, password, confirm: z.string(), name: z.string().max(80).optional() })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

export const loginSchema = z.object({ email, password: z.string().min(8, "Minimum 8 characters") });
export const otpSchema = z.object({ email, otp: z.string().length(6, "Enter the 6-digit code") });
export const forgotSchema = z.object({ email });
export const resetSchema = z.object({ token: z.string().min(1, "Missing reset token"), password });
export const sshKeySchema = z.object({
  name: z.string().min(1, "Name your key").max(80),
  publicKey: z.string().min(1, "Paste your public key").regex(/^(ssh-(rsa|ed25519|ecdsa)|ecdsa-)/, "Not a recognized public key format"),
});

/** 0-4 strength score for the meter (length + variety). */
export function passwordScore(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s += 1;
  return Math.min(4, s);
}
