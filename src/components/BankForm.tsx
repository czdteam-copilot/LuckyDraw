"use client";

import { useState, FormEvent } from "react";

interface BankFormProps {
  winnerId: string;
  prizeId: string;
  userName: string;
  onSuccess: () => void;
}

const POPULAR_BANKS = [
  "Vietcombank",
  "VietinBank",
  "Techcombank",
  "MB Bank",
  "BIDV",
  "Agribank",
  "ACB",
  "VPBank",
  "TPBank",
  "Sacombank",
  "VIB",
  "SHB",
  "HDBank",
  "MSB",
  "OCB",
  "LienVietPostBank",
  "SeABank",
  "Eximbank",
  "NCB",
  "PVcomBank",
  "BaoViet Bank",
  "Momo",
  "ZaloPay",
  "Khác",
];

export default function BankForm({ winnerId, prizeId, userName, onSuccess }: BankFormProps) {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountOwner, setAccountOwner] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!bankName || !accountNumber.trim() || !accountOwner.trim()) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/winners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winnerId,
          prizeId,
          userName,
          bankName,
          accountNumber: accountNumber.trim(),
          accountOwner: accountOwner.trim(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Có lỗi xảy ra.");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch {
      setError("Lỗi kết nối, vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gold/20 bg-white/10 p-6 shadow-xl backdrop-blur-sm sm:p-8"
    >
      <h3 className="lucky-text mb-6 text-center text-xl font-bold sm:text-2xl">
        💳 Thông tin nhận tiền
      </h3>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/30 p-3 text-center text-sm text-white">
          {error}
        </div>
      )}

      {/* Bank Name */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-yellow-warm">
          Ngân hàng / Ví điện tử
        </label>
        <select
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className="w-full rounded-lg border border-gold/30 bg-white/10 px-4 py-3 text-white outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
          required
        >
          <option value="" className="bg-red-dark text-white">
            -- Chọn ngân hàng --
          </option>
          {POPULAR_BANKS.map((b) => (
            <option key={b} value={b} className="bg-red-dark text-white">
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Account Number */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-yellow-warm">
          Số tài khoản / Số điện thoại
        </label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="VD: 0123456789"
          className="w-full rounded-lg border border-gold/30 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
          required
        />
      </div>

      {/* Account Owner */}
      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-yellow-warm">
          Tên chủ tài khoản
        </label>
        <input
          type="text"
          value={accountOwner}
          onChange={(e) => setAccountOwner(e.target.value)}
          placeholder="VD: NGUYEN VAN A"
          className="w-full rounded-lg border border-gold/30 bg-white/10 px-4 py-3 text-white uppercase placeholder-white/40 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-gold to-gold-light py-3 text-lg font-bold text-red-dark shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Đang gửi..." : "✅ Xác nhận"}
      </button>
    </form>
  );
}
