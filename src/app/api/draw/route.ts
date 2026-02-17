import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// POST /api/draw  — Atomically draw one prize
export async function POST() {
  try {
    // Call the atomic PL/pgSQL function
    const { data, error } = await supabaseAdmin.rpc("draw_prize");

    if (error) {
      console.error("draw_prize RPC error:", error);
      return NextResponse.json(
        { success: false, message: "Có lỗi xảy ra, vui lòng thử lại." },
        { status: 500 }
      );
    }

    const row = data?.[0];

    // Pool exhausted
    if (!row || row.won_prize_id === null) {
      return NextResponse.json({
        success: true,
        prize: null,
        message: "Chúc bạn may mắn lần sau! 🍀",
      });
    }

    return NextResponse.json({
      success: true,
      prize: {
        id: row.won_prize_id,
        label: row.won_prize_label,
        amount: row.won_prize_amount,
      },
    });
  } catch (err) {
    console.error("Draw API error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
