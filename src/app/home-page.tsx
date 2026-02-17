"use client";

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import confetti from "canvas-confetti";
import Envelope from "@/components/Envelope";
import ResultCard from "@/components/ResultCard";
import BankForm from "@/components/BankForm";
import Particles from "@/components/Particles";
import LoginPopup from "@/components/LoginPopup";

interface Prize {
  id: string;
  winnerId: string;
  label: string;
  amount: number;
}

type AppState = "idle" | "shaking" | "result" | "form" | "done" | "no-prize";

const COOKIE_KEY = "lixi_played";
const USERNAME_KEY = "lixi_username";

export default function HomePage() {
  const [state, setState] = useState<AppState>("idle");
  const [prize, setPrize] = useState<Prize | null>(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [savedPrize, setSavedPrize] = useState<Prize | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  // Check cookie on mount
  useEffect(() => {
    // Restore username
    const storedName = Cookies.get(USERNAME_KEY);
    if (storedName) {
      setUserName(storedName);
    }

    const stored = Cookies.get(COOKIE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAlreadyPlayed(true);
        if (parsed.amount > 0) {
          if (parsed.bankSubmitted) {
            // Already submitted bank info → show done
            setSavedPrize(parsed);
            setState("done");
          } else {
            // Won a prize but hasn't submitted bank info → show form
            setPrize(parsed);
            setSavedPrize(parsed);
            setState("form");
          }
        } else {
          setState("no-prize");
        }
      } catch {
        // Corrupted cookie, allow re-play
        Cookies.remove(COOKIE_KEY);
      }
    } else if (!storedName) {
      // No username yet and hasn't played → show login
      setShowLogin(true);
    }
  }, []);

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#f1c40f", "#e74c3c", "#ff6b6b", "#ffd700", "#ff4500"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const handleDraw = async () => {
    if (alreadyPlayed || state !== "idle") return;

    // If user somehow has no name, show login
    if (!userName) {
      setShowLogin(true);
      return;
    }

    setState("shaking");

    // Wait for shake animation
    await new Promise((r) => setTimeout(r, 1500));

    try {
      const res = await fetch("/api/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Có lỗi xảy ra!");
        setState("idle");
        return;
      }

      if (!data.prize) {
        // No prizes left
        Cookies.set(COOKIE_KEY, JSON.stringify({ amount: 0 }), { expires: 365 });
        setAlreadyPlayed(true);
        setState("no-prize");
      } else {
        const p: Prize = data.prize;
        setPrize(p);
        Cookies.set(COOKIE_KEY, JSON.stringify(p), { expires: 365 });
        setAlreadyPlayed(true);
        setState("result");
        fireConfetti();
      }
    } catch {
      alert("Lỗi kết nối, vui lòng thử lại.");
      setState("idle");
    }
  };

  const handleBankSubmitted = () => {
    // Mark bank info as submitted in the cookie so returning users see "done"
    const current = prize || savedPrize;
    if (current) {
      Cookies.set(
        COOKIE_KEY,
        JSON.stringify({ ...current, bankSubmitted: true }),
        { expires: 365 }
      );
    }
    setState("done");
  };

  const handleLogin = (name: string) => {
    setUserName(name);
    Cookies.set(USERNAME_KEY, name, { expires: 365 });
    setShowLogin(false);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Login Popup */}
      {showLogin && <LoginPopup onSubmit={handleLogin} />}

      {/* Floating particles background */}
      <Particles />

      {/* Decorative header */}
      <div className="animate-fadeInUp mb-2 text-center">
        <h1 className="lucky-text text-4xl font-extrabold tracking-wider sm:text-5xl md:text-6xl">
          🧧 Lì Xì - From BaChinh.Pham 🧧
        </h1>
        <p className="mt-3 text-lg text-yellow-warm/80 sm:text-xl">
          Chúc Mừng Năm Mới — Cùng Nhận Lì Xì May Mắn!
        </p>
        {userName && (
          <p className="mt-2 text-base text-gold/90">
            Xin chào, <span className="font-bold">{userName}</span>! 🎉
          </p>
        )}
      </div>

      {/* Step 1: Envelope */}
      {(state === "idle" || state === "shaking") && !alreadyPlayed && (
        <div className="mt-8 flex flex-col items-center gap-6">
          <Envelope
            shaking={state === "shaking"}
            onClick={handleDraw}
          />
          <button
            onClick={handleDraw}
            disabled={state === "shaking"}
            className="animate-glow rounded-full bg-gradient-to-r from-gold to-gold-light px-8 py-3 text-lg font-bold text-red-dark shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === "shaking" ? "Đang mở..." : "🎊 Nhận Lì Xì 🎊"}
          </button>
        </div>
      )}

      {/* Step 3: Result */}
      {state === "result" && prize && (
        <div className="animate-scaleIn mt-8">
          <ResultCard prize={prize} />
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setState("form")}
              className="rounded-full bg-gradient-to-r from-gold to-gold-light px-6 py-3 text-lg font-bold text-red-dark shadow-lg transition-all hover:scale-105"
            >
              💰 Rút Lì xì ngay
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Bank form */}
      {state === "form" && prize && (
        <div className="animate-fadeInUp mt-8 w-full max-w-md">
          <BankForm
            winnerId={prize.winnerId}
            prizeId={prize.id}
            userName={userName!}
            onSuccess={handleBankSubmitted}
          />
        </div>
      )}

      {/* Done state */}
      {state === "done" && (
        <div className="animate-fadeInUp mt-8 text-center">
          <div className="rounded-2xl border border-gold/30 bg-white/10 p-8 shadow-xl backdrop-blur-sm">
            <p className="text-5xl">✅</p>
            <h2 className="lucky-text mt-4 text-2xl font-bold">
              Cảm ơn bạn!
            </h2>
            {(prize || savedPrize) && (
              <p className="mt-2 text-lg text-yellow-warm">
                Bạn đã nhận được{" "}
                <span className="font-bold text-gold">
                  {(prize || savedPrize)!.label} - ({new Intl.NumberFormat("vi-VN").format((prize || savedPrize)!.amount)} VND)
                </span>
              </p>
            )}
            <p className="mt-2 text-sm text-white/60">
              Chúng tôi sẽ chuyển tiền trong thời gian sớm nhất. 🎉
            </p>
          </div>
        </div>
      )}

      {/* No prize left */}
      {state === "no-prize" && (
        <div className="animate-fadeInUp mt-8 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-8 shadow-xl backdrop-blur-sm">
            <p className="text-5xl">🍀</p>
            <h2 className="mt-4 text-2xl font-bold text-yellow-warm">
              Chúc bạn may mắn lần sau!
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Lì xì đã hết, hẹn gặp lại năm sau nhé!
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-10 text-center text-xs text-white/30">
        © {new Date().getFullYear()} Lì Xì Online — Chúc Mừng Năm Mới - From BaChinh.Pham 🎆
      </footer>
    </main>
  );
}
