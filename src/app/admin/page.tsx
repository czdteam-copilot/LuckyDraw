"use client";

import { useState, useEffect, useCallback } from "react";

interface Winner {
  id: string;
  prize_id: string;
  prize_amount: number;
  user_name: string | null;
  bank_name: string | null;
  bank_number: string | null;
  owner_name: string | null;
  is_transferred: boolean;
  created_at: string;
}

interface Prize {
  id: string;
  name: string;
  amount: number;
  quantity: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (pwd: string) => {
    setLoading(true);
    setError("");

    try {
      const [winnersRes, prizesRes] = await Promise.all([
        fetch(`/api/winners?password=${encodeURIComponent(pwd)}`),
        fetch("/api/prizes"),
      ]);

      const winnersData = await winnersRes.json();
      const prizesData = await prizesRes.json();

      if (!winnersRes.ok || !winnersData.success) {
        setError(winnersData.message || "Unauthorized");
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      setWinners(winnersData.winners || []);
      setPrizes(prizesData.prizes || []);
      setTotalRemaining(prizesData.totalRemaining ?? 0);
      setAuthenticated(true);
    } catch {
      setError("Lỗi kết nối.");
    }

    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(password);
  };

  // Auto-refresh every 30s
  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(() => fetchData(password), 30000);
    return () => clearInterval(interval);
  }, [authenticated, password, fetchData]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  // --- Login screen ---
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-gold/20 bg-white/10 p-8 shadow-2xl backdrop-blur-sm"
        >
          <h1 className="lucky-text mb-6 text-center text-2xl font-bold">
            🔐 Admin Dashboard
          </h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/30 p-3 text-center text-sm text-white">
              {error}
            </div>
          )}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu admin"
            className="mb-4 w-full rounded-lg border border-gold/30 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            autoFocus
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-gold to-gold-light py-3 font-bold text-red-dark shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    );
  }

  // --- Dashboard ---
  const totalWon = winners.reduce((s, w) => s + w.prize_amount, 0);
  const withBankInfo = winners.filter((w) => w.bank_name);
  const withoutBankInfo = winners.filter((w) => !w.bank_name);

  return (
    <div className="min-h-screen p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="lucky-text text-3xl font-extrabold">
          🎛️ Admin Dashboard
        </h1>
        <button
          onClick={() => fetchData(password)}
          className="rounded-full bg-gold/20 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/30"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tổng người trúng"
          value={winners.length.toString()}
          icon="🎯"
        />
        <StatCard
          label="Tổng tiền thưởng"
          value={formatMoney(totalWon)}
          icon="💰"
        />
        <StatCard
          label="Đã gửi bank info"
          value={withBankInfo.length.toString()}
          icon="✅"
        />
        <StatCard
          label="Lì xì còn lại"
          value={totalRemaining.toString()}
          icon="🧧"
        />
      </div>

      {/* Prize Pool */}
      <div className="mb-8 rounded-xl border border-gold/20 bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-bold text-gold">
          🎁 Kho Lì Xì
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {prizes.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-gold/10 bg-white/5 p-3 text-center"
            >
              <p className="text-sm text-white/60">{p.name}</p>
              <p
                className={`text-2xl font-bold ${p.quantity > 0 ? "text-gold" : "text-red-400"}`}
              >
                {p.quantity}
              </p>
              <p className="text-xs text-white/40">còn lại</p>
            </div>
          ))}
        </div>
      </div>

      {/* Winners without bank info */}
      {withoutBankInfo.length > 0 && (
        <div className="mb-8 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6">
          <h2 className="mb-4 text-xl font-bold text-yellow-400">
            ⚠️ Chưa gửi thông tin ngân hàng ({withoutBankInfo.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/60">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Người chơi</th>
                  <th className="px-3 py-2">Số tiền</th>
                  <th className="px-3 py-2">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {withoutBankInfo.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-white/5 text-white/80"
                  >
                    <td className="px-3 py-2">#{String(w.id).slice(0, 8)}</td>
                    <td className="px-3 py-2 font-medium text-gold-light">
                      {w.user_name || "—"}
                    </td>
                    <td className="px-3 py-2 font-medium text-gold">
                      {formatMoney(w.prize_amount)}
                    </td>
                    <td className="px-3 py-2 text-white/50">
                      {formatDate(w.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Winners with bank info (main table for money transfer) */}
      <div className="rounded-xl border border-gold/20 bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-bold text-gold">
          💳 Danh sách chuyển tiền ({withBankInfo.length})
        </h2>

        {withBankInfo.length === 0 ? (
          <p className="text-center text-white/40">Chưa có ai gửi thông tin.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/60">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Người chơi</th>
                  <th className="px-3 py-2">Số tiền</th>
                  <th className="px-3 py-2">Ngân hàng</th>
                  <th className="px-3 py-2">Số tài khoản</th>
                  <th className="px-3 py-2">Chủ tài khoản</th>
                  <th className="px-3 py-2">Đã CK</th>
                  <th className="px-3 py-2">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {withBankInfo.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="px-3 py-2 text-white/60">#{String(w.id).slice(0, 8)}</td>
                    <td className="px-3 py-2 font-medium text-gold-light">
                      {w.user_name || "—"}
                    </td>
                    <td className="px-3 py-2 font-semibold text-gold">
                      {formatMoney(w.prize_amount)}
                    </td>
                    <td className="px-3 py-2">{w.bank_name}</td>
                    <td className="px-3 py-2 font-mono text-gold-light">
                      {w.bank_number}
                    </td>
                    <td className="px-3 py-2 font-medium uppercase">
                      {w.owner_name}
                    </td>
                    <td className="px-3 py-2">
                      {w.is_transferred
                        ? <span className="text-green-400">✅</span>
                        : <span className="text-white/30">—</span>}
                    </td>
                    <td className="px-3 py-2 text-white/50">
                      {formatDate(w.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-gold/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-sm text-white/50">{label}</p>
          <p className="text-xl font-bold text-gold">{value}</p>
        </div>
      </div>
    </div>
  );
}
