import { useEffect, useRef, useState } from 'react';

interface Props {
  show: boolean;
  onEnd: () => void;
}

// Sincronizado con el descenso de la luz en el motor (GameEngine.dur).
// Ritmo pausado para que dé tiempo a leer cada versículo con calma.
const DURATION = 28;

const TEXTS: Array<{ start: number; end: number; text: string }> = [
  { start: 0.03, end: 0.21, text: 'De todo árbol del jardín podrás comer' },
  { start: 0.25, end: 0.45, text: 'mas del árbol del conocimiento del bien y del mal' },
  { start: 0.49, end: 0.64, text: 'no comerás' },
  { start: 0.68, end: 0.85, text: 'porque el día que de él comieres...' },
  { start: 0.88, end: 0.99, text: 'ciertamente morirás' },
];

export default function ForbiddenTreeCinematic({ show, onEnd }: Props) {
  const [progress, setProgress] = useState(0);

  // Guardamos onEnd en una ref: si dependiéramos de él en el efecto, al ser una
  // arrow inline en App se recrearía en cada render, reiniciando la animación
  // una y otra vez (la cinemática nunca avanzaba y quedaba la pantalla negra).
  const onEndRef = useRef(onEnd);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  useEffect(() => {
    if (!show) {
      setProgress(0);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    let done = false;

    const tick = (now: number) => {
      const p = Math.min((now - t0) / (DURATION * 1000), 1);
      setProgress(p);
      if (p >= 1) {
        if (!done) {
          done = true;
          onEndRef.current();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Red de seguridad: si el rAF se pausara (pestaña en segundo plano, etc.)
    // la cinemática termina igualmente y nunca deja el juego bloqueado.
    const failsafe = setTimeout(() => {
      if (!done) {
        done = true;
        onEndRef.current();
      }
    }, DURATION * 1000 + 1500);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
    };
  }, [show]);

  // ⚠️ Ningún hook por debajo de este punto: el early return cambiaría el
  // número de hooks entre renders y React rompería la app entera.
  if (!show) return null;

  const barH = 10;
  const endFade = progress > 0.94 ? (progress - 0.94) / 0.06 : 0;
  // Fundido de entrada desde negro, muy breve
  const openFade = progress < 0.03 ? 1 - progress / 0.03 : 0;

  const current = TEXTS.find(t => progress >= t.start && progress <= t.end);
  const fullText = current?.text || '';

  let localProgress = 0;
  let textOpacity = 0;
  if (current && fullText) {
    const range = current.end - current.start;
    const local = (progress - current.start) / range;
    // Se escribe en el primer 40% del tramo y el resto queda fijo en pantalla,
    // así hay tiempo de sobra para leerlo entero.
    localProgress = Math.min(1, local / 0.4);
    if (local > 0.88) textOpacity = (1 - local) / 0.12;
    else if (local < 0.06) textOpacity = local / 0.06;
    else textOpacity = 1;
  }

  const chars = Math.floor(fullText.length * Math.min(1, localProgress));
  const displayText = fullText.substring(0, chars);

  return (
    <div className="absolute inset-0 pointer-events-none z-[55]">
      {/* Fundido de entrada */}
      {openFade > 0 && (
        <div className="absolute inset-0 bg-black" style={{ opacity: openFade }} />
      )}

      {/* Barras cinematográficas */}
      <div className="absolute top-0 left-0 right-0 bg-black" style={{ height: `${barH}vh` }} />
      <div className="absolute bottom-0 left-0 right-0 bg-black" style={{ height: `${barH}vh` }} />

      {/* Vignette roja sutil */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle, transparent 40%, rgba(80,0,0,0.2) 100%)' }}
      />

      {/* Texto */}
      {displayText && (
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center"
             style={{ paddingBottom: `${barH + 2.5}vh` }}>
          <p className="text-center text-base md:text-lg lg:text-xl px-8 max-w-2xl whitespace-pre-line"
             style={{
               fontFamily: 'Georgia, "Palatino Linotype", serif',
               fontStyle: 'italic',
               color: 'rgba(255,230,200,0.95)',
               opacity: textOpacity * (1 - endFade),
               textShadow: '0 0 16px rgba(180,60,0,0.4), 0 2px 6px rgba(0,0,0,0.9)',
               lineHeight: 1.9,
               letterSpacing: '0.04em',
             }}>
            {displayText}
            <span style={{ opacity: localProgress < 1 ? 1 : 0, animation: 'cursorBlink 0.6s step-end infinite' }}>|</span>
          </p>
        </div>
      )}

      {/* Referencia bíblica arriba */}
      {progress > 0.04 && progress < 0.90 && (
        <div className="absolute top-0 right-0"
             style={{ paddingTop: `${barH + 0.5}vh`, paddingRight: '1rem' }}>
          <span className="text-white/20 text-[9px] font-mono tracking-widest"
                style={{
                  opacity: progress < 0.08 ? (progress - 0.04) / 0.04
                         : progress > 0.86 ? (0.90 - progress) / 0.04 : 1
                }}>
            GÉNESIS 2
          </span>
        </div>
      )}

      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
