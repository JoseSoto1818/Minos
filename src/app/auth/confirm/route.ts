import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  if (getSupabaseConfig()) {
    const supabase = await createClient();
    const code = url.searchParams.get("code");
    const token = url.searchParams.get("token_hash");
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL("/", origin));
    } else if (token && url.searchParams.get("type") === "email") {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "email",
      });
      if (!error) return NextResponse.redirect(new URL("/", origin));
    }
  }
  return NextResponse.redirect(
    new URL("/iniciar-sesion?error=confirmacion", origin),
  );
}
