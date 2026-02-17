"use client";

interface Prize {
  id: string;
  label: string;
  amount: number;
}

interface ResultCardProps {
  prize: Prize;
}

export default function ResultCard({ prize }: ResultCardProps) {
  return (
    <div className="rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-red-dark/80 to-red-primary/60 p-8 text-center shadow-2xl backdrop-blur-sm">
      {/* Celebration emoji */}
      <p className="text-5xl">🎉</p>

      <h2 className="lucky-text mt-4 text-xl font-bold sm:text-2xl">
        Chúc mừng bạn!
      </h2>

      <p className="mt-2 text-white/70">Bạn đã nhận được lì xì</p>

      {/* Prize amount */}
      <div className="mx-auto mt-4 inline-block rounded-xl bg-gold/20 px-6 py-3">
        <span className="text-3xl font-extrabold text-gold sm:text-4xl">
          {prize.label}
        </span>
      </div>

      <p className="mt-4 text-sm text-white/50">
        Vui lòng nhập thông tin ngân hàng để nhận tiền 💸
      </p>
    </div>
  );
}
