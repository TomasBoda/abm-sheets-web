import { createServerClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
    const { email, password } = await request.json();

    const supabase = await createServerClient();
    
    const response = await supabase.auth.signInWithPassword({ email, password });

    if (response.error) {
        return Response.json({ status: 400 }, { status: 400 });
    }

    return Response.json({ status: 200 }, { status: 200 });
}