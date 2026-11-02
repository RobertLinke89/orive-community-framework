import { useMemo } from "react";
import oriveLogo from "@/assets/orive-bird-logo.png";

export function LoadingScreen() {
  // Generate random particles for cosmic background (dark mode only)
  const particles = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
    })), []
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a1628] overflow-hidden relative">
      {/* Cosmic star particles - dark mode only */}
      <div className="absolute inset-0 overflow-hidden hidden dark:block">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-highlight/60"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `twinkle ${p.duration}s ease-in-out infinite ${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Central container */}
      <div className="relative flex items-center justify-center">
        {/* Logo - static and centered */}
        <img 
          src={oriveLogo.src} 
          alt="Orive" 
          className="w-16 h-16 object-contain relative z-10"
        />
      </div>
      
      <style>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }
      `}</style>
    </div>
  );
}
