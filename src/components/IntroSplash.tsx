import { useEffect, useState, useCallback, useMemo } from 'react';

interface Props { onEnd: () => void; }

const LETTERS = 'PSYCODELICINSANE'.split('');
const COLORS = [
  '#ff4466','#ff6633','#ff9922','#ffbb22','#ffdd33',
  '#aaee44','#44ee77','#33ccaa','#3399dd','#4466ff',
  '#7744ff','#aa44ee','#dd33bb','#ff3388','#ff4466','#ff6633',
];

export default function IntroSplash({ onEnd }: Props) {
  const [phase, setPhase] = useState(0);
  const skip = useCallback(() => onEnd(), [onEnd]);

  const stars = useMemo(() =>
    Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: 1 + Math.random() * 2,
      d: 2.5 + Math.random() * 3,
      dl: Math.random() * 2,
    })), []);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1900),
      setTimeout(() => setPhase(3), 3800),
      setTimeout(() => setPhase(4), 7200),
      setTimeout(skip, 8400),
    ];
    return () => t.forEach(clearTimeout);
  }, [skip]);

  const visible = phase >= 1;
  const nameIn = phase >= 2;
  const glow = phase >= 3;
  const out = phase >= 4;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center select-none"
      style={{
        background: '#000',
        opacity: out ? 0 : 1,
        transition: out ? 'opacity 1.2s ease-in' : 'none',
      }}
      onClick={skip}
    >
      {/* Estrellas */}
      {stars.map((st, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: st.s, height: st.s,
            left: `${st.x}%`, top: `${st.y}%`,
            background: '#fff',
            animation: visible ? `twink ${st.d}s ease-in-out ${st.dl}s infinite` : 'none',
            opacity: 0,
          }}
        />
      ))}

      {/* Resplandor */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: glow ? 500 : 60,
          height: glow ? 500 : 60,
          background: 'radial-gradient(circle, rgba(255,170,50,0.15) 0%, rgba(255,80,30,0.05) 50%, transparent 70%)',
          transition: 'all 1.5s cubic-bezier(0.16,1,0.3,1)',
        }}
      />

      {/* Línea de luz */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '100%', height: 1,
          background: 'linear-gradient(90deg, transparent 10%, rgba(255,220,120,0.5) 50%, transparent 90%)',
          opacity: glow ? 1 : 0,
          transform: glow ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1)',
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 text-center px-4">
        <div
          className="flex items-center justify-center flex-wrap"
          style={{
            opacity: nameIn ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        >
          {LETTERS.map((letter, i) => (
            <span
              key={i}
              className="inline-block font-black text-3xl md:text-5xl lg:text-7xl"
              style={{
                fontFamily: 'Impact, "Arial Black", sans-serif',
                color: glow ? COLORS[i % COLORS.length] : '#999',
                textShadow: glow
                  ? `0 0 20px ${COLORS[i % COLORS.length]}88, 0 0 40px ${COLORS[i % COLORS.length]}44, 0 2px 0 rgba(0,0,0,0.8)`
                  : '0 2px 0 rgba(0,0,0,0.5)',
                transform: nameIn
                  ? 'translateY(0) scale(1)'
                  : `translateY(${40 + i * 3}px) scale(0.5)`,
                transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s`,
                animation: glow ? `letterFloat 3s ease-in-out ${i * 0.15}s infinite` : 'none',
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 mt-8">
          <div style={{
            height: 1,
            width: nameIn ? 60 : 0,
            background: glow ? 'linear-gradient(90deg, transparent, #ffaa44)' : 'linear-gradient(90deg, transparent, #444)',
            transition: 'all 1s ease 0.2s',
          }} />
          <div className="rounded-full" style={{
            width: 4, height: 4,
            background: glow ? '#ffcc55' : '#444',
            boxShadow: glow ? '0 0 8px #ffaa33' : 'none',
            opacity: nameIn ? 1 : 0,
            transition: 'all 0.8s ease 0.4s',
          }} />
          <div style={{
            height: 1,
            width: nameIn ? 60 : 0,
            background: glow ? 'linear-gradient(270deg, transparent, #ffaa44)' : 'linear-gradient(270deg, transparent, #444)',
            transition: 'all 1s ease 0.2s',
          }} />
        </div>

        <p
          className="font-mono tracking-[0.5em] mt-7 text-xs md:text-sm"
          style={{
            color: 'rgba(255,255,255,0.3)',
            opacity: glow ? 1 : 0,
            transform: glow ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.8s ease 0.3s',
          }}
        >
          PRESENTS
        </p>
      </div>

      <style>{`
        @keyframes twink {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.7; }
        }
        @keyframes letterFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
