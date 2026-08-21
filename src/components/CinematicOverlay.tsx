import { useMemo } from 'react';

interface CinematicOverlayProps {
  progress: number;
}

const TEXTS: Array<{ start: number; end: number; text: string }> = [
  { start: 0.02, end: 0.13, text: 'Y Dios creó los cielos y la tierra...' },
  { start: 0.15, end: 0.26, text: 'Y plantó un jardín en el Edén' },
  { start: 0.28, end: 0.40, text: 'E hizo brotar del suelo todo árbol agradable a la vista' },
  { start: 0.42, end: 0.54, text: 'Y en medio del jardín, el árbol del conocimiento' },
  { start: 0.56, end: 0.68, text: 'Entonces Dios formó al hombre del polvo de la tierra...' },
  { start: 0.70, end: 0.82, text: 'Y sopló en su nariz aliento de vida' },
  { start: 0.84, end: 0.94, text: 'Y el hombre fue alma viviente' },
];

// Efecto máquina de escribir: muestra solo parte del texto
function useTypedText(text: string, revealFraction: number): string {
  return useMemo(() => {
    if (!text) return '';
    const chars = Math.floor(text.length * Math.min(1, revealFraction));
    return text.substring(0, chars);
  }, [text, revealFraction]);
}

export default function CinematicOverlay({ progress }: CinematicOverlayProps) {
  const barsOpen = progress > 0.92;
  const barH = barsOpen
    ? Math.max(0, 1 - (progress - 0.92) / 0.08) * 10
    : 10;

  const blackFade = progress < 0.05 ? 1 - progress / 0.05 : 0;

  const current = TEXTS.find(t => progress >= t.start && progress <= t.end);
  const fullText = current?.text || '';

  // Calcular progreso local para el efecto de escritura
  let localProgress = 0;
  let textOpacity = 0;
  if (current && fullText) {
    const range = current.end - current.start;
    const local = (progress - current.start) / range;
    // Primeros 60% del rango: escribir letra a letra
    // Últimos 20%: fade out
    localProgress = Math.min(1, local / 0.6);
    if (local > 0.85) textOpacity = (1 - local) / 0.15;
    else if (local < 0.08) textOpacity = local / 0.08;
    else textOpacity = 1;
  }

  const displayText = useTypedText(fullText, localProgress);

  return (
    <>
      {/* Negro inicial */}
      {blackFade > 0 && (
        <div className="absolute inset-0 bg-black pointer-events-none z-[60]"
             style={{ opacity: blackFade }} />
      )}

      {/* Barras cinematográficas */}
      <div className="absolute top-0 left-0 right-0 bg-black pointer-events-none z-[55]"
           style={{ height: `${barH}vh` }} />
      <div className="absolute bottom-0 left-0 right-0 bg-black pointer-events-none z-[55]"
           style={{ height: `${barH}vh` }} />

      {/* Texto con efecto escritura */}
      {displayText && (
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[56] flex items-end justify-center"
             style={{ paddingBottom: `${barH + 1.5}vh` }}>
          <p className="text-center text-base md:text-lg lg:text-xl px-8 max-w-2xl whitespace-pre-line"
             style={{
               fontFamily: 'Georgia, "Palatino Linotype", serif',
               fontStyle: 'italic',
               color: 'rgba(255,255,255,0.92)',
               opacity: textOpacity,
               textShadow: '0 0 12px rgba(0,0,0,1), 0 2px 6px rgba(0,0,0,0.9)',
               lineHeight: 1.9,
               letterSpacing: '0.05em',
             }}>
            {displayText}
            <span style={{ opacity: localProgress < 1 ? 1 : 0, animation: 'cursorBlink 0.6s step-end infinite' }}>|</span>
          </p>
        </div>
      )}

      {/* Génesis */}
      {progress > 0.04 && progress < 0.90 && (
        <div className="absolute top-0 right-0 pointer-events-none z-[56]"
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
    </>
  );
}
