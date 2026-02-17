import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// POST /api/winners — Save bank details for a winner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prizeId, bankName, accountNumber, accountOwner } = body;

    if (!prizeId || !bankName || !accountNumber || !accountOwner) {
      return NextResponse.json(
        { success: false, message: "Vui lòng điền đầy đủ thông tin." },
        { status: 400 }
      );
    }

    // Update the most recent winner row that matches this prize_id and has no bank info yet
    const { error } = await supabaseAdmin
      .from("winners")
      .update({
        bank_name: bankName,
        bank_number: accountNumber,
        owner_name: accountOwner,
      })
      .eq("prize_id", prizeId)
      .is("bank_name", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Update winner error:", error);
      return NextResponse.json(
        { success: false, message: "Không thể lưu thông tin." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Winners API error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// GET /api/winners — List all winners (for admin dashboard)
export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password");

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("winners")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, winners: data });
}
