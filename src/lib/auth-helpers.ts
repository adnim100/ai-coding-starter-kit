import { auth } from "./auth";
import bcrypt from "bcryptjs";
import { TOTP } from "otpauth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Get the current authenticated user session (server-side)
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized - Authentication required");
  }
  return user;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a new TOTP secret for 2FA
 */
export function generateTotpSecret(
  userEmail: string
): { secret: string; qrCodeUrl: string } {
  const totp = new TOTP({
    issuer: "ProjectHub",
    label: userEmail,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  });

  return {
    secret: totp.secret.base32,
    qrCodeUrl: totp.toString(),
  };
}

/**
 * Verify a TOTP code
 */
export function verifyTotpCode(secret: string, code: string): boolean {
  const totp = new TOTP({
    secret: secret,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  });

  const delta = totp.validate({
    token: code,
    window: 1, // Allow 1 step before/after for clock skew
  });

  return delta !== null;
}

/**
 * Generate a random alphanumeric code
 */
function generateRandomCode(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate recovery codes for 2FA
 */
export async function generateRecoveryCodes(
  userId: string,
  count: number = 10
): Promise<string[]> {
  const codes: string[] = [];

  // Generate random recovery codes
  for (let i = 0; i < count; i++) {
    const code = generateRandomCode(8);
    codes.push(code);

    // Hash and store in database
    const codeHash = await hashPassword(code);
    await supabase.from("recovery_codes").insert({
      user_id: userId,
      code_hash: codeHash,
      used: false,
    });
  }

  return codes;
}

/**
 * Verify a recovery code
 */
export async function verifyRecoveryCode(
  userId: string,
  code: string
): Promise<boolean> {
  const { data: recoveryCodes } = await supabase
    .from("recovery_codes")
    .select("id, code_hash")
    .eq("user_id", userId)
    .eq("used", false);

  if (!recoveryCodes) return false;

  for (const recoveryCode of recoveryCodes) {
    const isValid = await verifyPassword(code, recoveryCode.code_hash);
    if (isValid) {
      // Mark as used
      await supabase
        .from("recovery_codes")
        .update({
          used: true,
          used_at: new Date().toISOString(),
        })
        .eq("id", recoveryCode.id);
      return true;
    }
  }

  return false;
}

/**
 * Check if user has 2FA enabled
 */
export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from("users")
    .select("totp_enabled")
    .eq("id", userId)
    .single();

  return user?.totp_enabled ?? false;
}

/**
 * Enable 2FA for a user
 */
export async function enableTwoFactor(
  userId: string,
  totpSecret: string
): Promise<void> {
  await supabase
    .from("users")
    .update({
      totp_secret: totpSecret,
      totp_enabled: true,
    })
    .eq("id", userId);
}

/**
 * Disable 2FA for a user
 */
export async function disableTwoFactor(userId: string): Promise<void> {
  await supabase
    .from("users")
    .update({
      totp_secret: null,
      totp_enabled: false,
    })
    .eq("id", userId);

  // Delete all recovery codes
  await supabase.from("recovery_codes").delete().eq("user_id", userId);
}
