import { useEffect, useState } from 'react';

interface Thought { text: string; key: number; }

interface Props { thought: Thought | null; }

export default function AdamThought({ thought }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!thought) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(timer);
  }, [thought]); // ← thought cambia siempre (la key es única), incluso si el texto se repite

  if (!thought || !visible) return null;

  return (
    <div
      key={thought.key}
      className="absolute inset-x-0 pointer-events-none z-50 flex justify-center"
      style={{
        top: '18%',
        animation: 'thoughtFade 3.2s ease-in-out forwards',
      }}
    >
      <p
        className="text-center px-8 max-w-xl"
        style={{
          fontFamily: 'Georgia, "Palatino Linotype", serif',
          fontStyle: 'italic',
          fontSize: 'clamp(0.95rem, 2.4vw, 1.35rem)',
          color: 'rgba(255,255,255,0.94)',
          textShadow: '0 0 14px rgba(0,0,0,1), 0 2px 6px rgba(0,0,0,0.9)',
          letterSpacing: '0.04em',
          lineHeight: 1.7,
        }}
      >
        "{thought.text}"
      </p>

      <style>{`
        @keyframes thoughtFade {
          0% { opacity: 0; transform: translateY(8px); }
          12% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
