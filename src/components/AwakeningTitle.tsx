import { useEffect, useState } from 'react';

interface Props { show: boolean; }

export default function AwakeningTitle({ show }: Props) {
  const [phase, setPhase] = useState(0);
  // 0 hidden, 1 fade in, 2 hold, 3 fade out, 4 gone

  useEffect(() => {
    if (!show) return;
    setPhase(1);
    const timers = [
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(() => setPhase(4), 4700),
    ];
    return () => timers.forEach(clearTimeout);
  }, [show]);

  if (!show || phase === 0 || phase === 4) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-40 flex flex-col items-center justify-center"
      style={{
        opacity: phase >= 3 ? 0 : 1,
        animation:
          phase === 1 || phase === 2
            ? 'fadeInAwakening 0.9s ease-out forwards'
            : 'fadeOutAwakening 1.5s ease-in forwards',
      }}
    >
      <span
        className="text-white/40 text-[10px] md:text-xs font-mono tracking-[0.6em] uppercase"
        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
      >
        Genesis
      </span>
      <h1
        className="text-white text-2xl md:text-4xl lg:text-5xl mt-3 tracking-[0.18em]"
        style={{
          fontFamily: 'Georgia, "Palatino Linotype", serif',
          fontStyle: 'italic',
          textShadow: '0 0 24px rgba(0,0,0,1), 0 2px 8px rgba(0,0,0,0.9)',
        }}
      >
        El despertar de Adán
      </h1>

      <style>{`
        @keyframes fadeInAwakening {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOutAwakening {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
