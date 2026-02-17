"use client";

import { useState, FormEvent, useEffect, useRef } from "react";

interface LoginPopupProps {
  onSubmit: (userName: string) => void;
}

export default function LoginPopup({ onSubmit }: LoginPopupProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the input when popup mounts
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Vui lòng nhập tên của bạn.");
      return;
    }
    if (trimmed.length < 2) {
      setError("Tên phải có ít nhất 2 ký tự.");
      return;
    }
    if (trimmed.length > 50) {
      setError("Tên không được quá 50 ký tự.");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="animate-scaleIn mx-4 w-full max-w-sm rounded-2xl border-2 border-gold/30 bg-gradient-to-br from-red-dark/95 to-red-primary/90 p-8 shadow-2xl">
        {/* Header icon */}
        <div className="mb-4 text-center">
          <span className="text-5xl">🧧</span>
        </div>

        <h2 className="lucky-text mb-2 text-center text-2xl font-bold">
          Xin chào!
        </h2>
        <p className="mb-6 text-center text-sm text-yellow-warm/70">
          Nhập tên của bạn để nhận Lì Xì may mắn
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-3 rounded-lg bg-red-500/30 px-3 py-2 text-center text-sm text-white">
              {error}
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="VD: Nguyễn Văn A"
            maxLength={50}
            className="mb-4 w-full rounded-lg border border-gold/30 bg-white/10 px-4 py-3 text-center text-lg text-white placeholder-white/40 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
          />

          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-gold to-gold-light py-3 text-lg font-bold text-red-dark shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            🎊 Bắt đầu
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/30">
          Mỗi người chỉ được nhận lì xì 1 lần
        </p>
      </div>
    </div>
  );
}
