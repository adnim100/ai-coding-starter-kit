import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TOTP } from "otpauth";

// Prisma Client Singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Get the current authenticated user session (server-side)
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
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
    await prisma.recoveryCode.create({
      data: {
        userId,
        codeHash,
        used: false,
      },
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
  const recoveryCodes = await prisma.recoveryCode.findMany({
    where: {
      userId,
      used: false,
    },
  });

  for (const recoveryCode of recoveryCodes) {
    const isValid = await verifyPassword(code, recoveryCode.codeHash);
    if (isValid) {
      // Mark as used
      await prisma.recoveryCode.update({
        where: { id: recoveryCode.id },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });
      return true;
    }
  }

  return false;
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
 * Check if user has 2FA enabled
 */
export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpEnabled: true },
  });

  return user?.totpEnabled ?? false;
}

/**
 * Enable 2FA for a user
 */
export async function enableTwoFactor(
  userId: string,
  totpSecret: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      totpSecret,
      totpEnabled: true,
    },
  });
}

/**
 * Disable 2FA for a user
 */
export async function disableTwoFactor(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      totpSecret: null,
      totpEnabled: false,
    },
  });

  // Delete all recovery codes
  await prisma.recoveryCode.deleteMany({
    where: { userId },
  });
}
