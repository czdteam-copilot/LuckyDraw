import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// GET /api/prizes — Return current prize pool status
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("prizes")
    .select("id, name, amount, quantity")
    .order("amount", { ascending: true });

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  const totalRemaining = data?.reduce((sum, p) => sum + p.quantity, 0) ?? 0;

  return NextResponse.json({ success: true, prizes: data, totalRemaining });
}
