import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createSecureClient<T>() {
    return createSupabaseClient<T>(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            }
        }
    )
}