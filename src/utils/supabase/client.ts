import { createBrowserClient as createSupabaseClient } from "@supabase/ssr";

export function createClientClient<T>() {
  return createSupabaseClient<T>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}