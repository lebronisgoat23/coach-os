import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Check if Supabase is configured
export const IS_SUPABASE_CONFIGURED =
  !!supabaseUrl &&
  supabaseUrl !== "https://YOUR_PROJECT.supabase.co" &&
  !!supabaseAnonKey &&
  supabaseAnonKey !== "your-anon-key-here";

// Create client (safe even if not configured — operations will fail gracefully)
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

// ============================================================
// Auth helpers
// ============================================================

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/`,
    },
  });
  return { data, error };
}

export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/`,
    },
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}
