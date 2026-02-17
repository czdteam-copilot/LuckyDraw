import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// POST /api/winners — Save bank details for a winner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { winnerId, prizeId, userName, bankName, accountNumber, accountOwner } = body;

    if (!winnerId || !prizeId || !userName || !bankName || !accountNumber || !accountOwner) {
      return NextResponse.json(
        { success: false, message: "Vui lòng điền đầy đủ thông tin." },
        { status: 400 }
      );
    }

    // Update the exact winner row: match by id, user_name, prize_id, and no bank info yet
    const { error, count } = await supabaseAdmin
      .from("winners")
      .update(
        {
          bank_name: bankName,
          bank_number: accountNumber,
          owner_name: accountOwner,
        },
        { count: "exact" }
      )
      .eq("id", winnerId)
      .eq("prize_id", prizeId)
      .eq("user_name", userName)
      .is("bank_name", null);

    if (!error && count === 0) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy bản ghi phù hợp hoặc đã cập nhật rồi." },
        { status: 404 }
      );
    }

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

// PATCH /api/winners — Toggle is_transferred status (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { winnerId, isTransferred, password: pwd } = body;

    if (pwd !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!winnerId || typeof isTransferred !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Missing winnerId or isTransferred" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("winners")
      .update({ is_transferred: isTransferred })
      .eq("id", winnerId);

    if (error) {
      console.error("Toggle transfer error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH winners error:", err);
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
