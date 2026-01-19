import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client - uses anon key with RLS policies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const { data: existingUsers, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .limit(1);

    if (findError) {
      console.error("[Register] Error checking existing user:", findError);
      return NextResponse.json(
        { error: "Ein Fehler ist aufgetreten. Bitte versuche es erneut." },
        { status: 500 }
      );
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Ein Account mit dieser Email existiert bereits" },
        { status: 400 }
      );
    }

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email: normalizedEmail,
        password_hash: passwordHash,
        email_verified: true, // Auto-verify for now (no email service configured)
      })
      .select("id, email")
      .single();

    if (createError) {
      console.error("[Register] Error creating user:", createError);
      return NextResponse.json(
        { error: "Ein Fehler ist aufgetreten. Bitte versuche es erneut." },
        { status: 500 }
      );
    }

    console.log(`[Register] User created: ${newUser.email}`);

    return NextResponse.json(
      {
        success: true,
        message: "Account erfolgreich erstellt",
        userId: newUser.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register] Error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten. Bitte versuche es erneut." },
      { status: 500 }
    );
  }
}
