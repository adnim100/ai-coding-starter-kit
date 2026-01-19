import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client - uses anon key with RLS policies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Credentials Provider (Email/Password with bcrypt)
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email und Passwort sind erforderlich");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const totpCode = credentials.totpCode as string | undefined;

        // Find user by email using Supabase Data API (HTTPS)
        const { data: user, error } = await supabase
          .from("users")
          .select("id, email, password_hash, name, image, email_verified, totp_enabled, totp_secret")
          .eq("email", email.toLowerCase())
          .single();

        if (error || !user) {
          throw new Error("Ungültige Email oder Passwort");
        }

        if (!user.password_hash) {
          throw new Error("Ungültige Email oder Passwort");
        }

        // Verify password with bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
          throw new Error("Ungültige Email oder Passwort");
        }

        // Check if 2FA is enabled
        if (user.totp_enabled) {
          if (!totpCode) {
            throw new Error("2FA_REQUIRED");
          }

          // Verify TOTP code using otpauth
          const { TOTP } = await import("otpauth");

          if (!user.totp_secret) {
            throw new Error("2FA ist aktiviert aber Secret fehlt");
          }

          const totp = new TOTP({
            secret: user.totp_secret,
            digits: 6,
            period: 30,
            algorithm: "SHA1",
          });

          const isValidTotp = totp.validate({
            token: totpCode,
            window: 1,
          }) !== null;

          if (!isValidTotp) {
            throw new Error("Ungültiger 2FA Code");
          }
        }

        // Return user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),

    // Google OAuth Provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  // Callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },

  // Pages
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Trust host
  trustHost: true,

  // Debug
  debug: process.env.NODE_ENV === "development",
});
