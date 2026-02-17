"use client";

interface EnvelopeProps {
  shaking: boolean;
  onClick: () => void;
}

export default function Envelope({ shaking, onClick }: EnvelopeProps) {
  return (
    <div
      onClick={onClick}
      className={`envelope ${shaking ? "animate-shake" : "animate-float"}`}
      role="button"
      tabIndex={0}
      aria-label="Mở lì xì"
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Gold seal */}
      <div className="envelope-seal">福</div>

      {/* Decorative border lines */}
      <div className="absolute inset-x-4 top-[100px] bottom-4 rounded-lg border-2 border-gold/20" />

      {/* Bottom text */}
      <div className="absolute bottom-5 left-0 right-0 text-center">
        <span className="text-xs font-medium tracking-widest text-gold/60 uppercase">
          Chúc Mừng Năm Mới
        </span>
      </div>
    </div>
  );
}
