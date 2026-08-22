import { useEffect, useState, type CSSProperties } from 'react';

interface Registry {
  distanceWalked: number;
  timePlayed: number;
  jumps: number;
  sprints: number;
  food: number;
  discoveries: number;
  gamesPlayed: number;
  bestScore: number;
  memoryAwakening: boolean;
  memoryMandate: boolean;
  memoryDoubts: boolean;
  hasSeenAwakening: boolean;
}

interface Props {
  onStart: () => void;
}

type Page = 'main' | 'memories' | 'stats' | 'map';

const DEFAULT_REGISTRY: Registry = {
  distanceWalked: 0,
  timePlayed: 0,
  jumps: 0,
  sprints: 0,
  food: 0,
  discoveries: 0,
  gamesPlayed: 0,
  bestScore: 0,
  memoryAwakening: false,
  memoryMandate: false,
  memoryDoubts: false,
  hasSeenAwakening: false,
};

const MEMORIES: Array<{ key: keyof Registry; title: string; desc: string }> = [
  { key: 'memoryAwakening', title: 'El Despertar', desc: 'La primera mañana del hombre en el jardín.' },
  { key: 'memoryMandate', title: 'El Mandamiento', desc: 'Escuchaste la advertencia sobre el árbol prohibido.' },
  { key: 'memoryDoubts', title: 'Las Dudas', desc: 'Todos los pensamientos de Adán junto al árbol.' },
];

const gold = (a: number) => `rgba(224,190,120,${a})`;
const SERIF_SHADOW = '0 2px 8px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.9)';

// Letras doradas elegantes: degradado + borde fino + brillo suave
const GOLD_TEXT: CSSProperties = {
  backgroundImage: 'linear-gradient(180deg, #fffbe6 0%, #ffe9a8 25%, #f5c34a 50%, #d99a1f 80%, #a8740e 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextStroke: '1px rgba(58,36,4,0.6)',
  filter: 'drop-shadow(0 2px 1px rgba(40,24,2,0.85)) drop-shadow(0 0 16px rgba(255,195,80,0.35))',
};

const FRAME_BORDER = '2px solid rgba(224,190,120,0.7)';
const FRAME_OUTLINE = '1px solid rgba(224,190,120,0.3)';
const CORNER = '#ffd166';

function FrameCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const s: CSSProperties = {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: CORNER,
    borderStyle: 'solid',
    borderWidth: 0,
    filter: 'drop-shadow(0 0 6px rgba(255,200,90,0.55))',
    opacity: 0.9,
  };
  if (pos === 'tl') { s.top = -9; s.left = -9; s.borderTopWidth = 3; s.borderLeftWidth = 3; }
  if (pos === 'tr') { s.top = -9; s.right = -9; s.borderTopWidth = 3; s.borderRightWidth = 3; }
  if (pos === 'bl') { s.bottom = -9; s.left = -9; s.borderBottomWidth = 3; s.borderLeftWidth = 3; }
  if (pos === 'br') { s.bottom = -9; s.right = -9; s.borderBottomWidth = 3; s.borderRightWidth = 3; }
  return <span aria-hidden style={s} />;
}

function readRegistry(): Registry {
  try {
    const saved = localStorage.getItem('edenRegistry');
    return saved ? { ...DEFAULT_REGISTRY, ...JSON.parse(saved) } : { ...DEFAULT_REGISTRY };
  } catch {
    return { ...DEFAULT_REGISTRY };
  }
}

export default function StartScreen({ onStart }: Props) {
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState<Page>('main');
  const [registry] = useState<Registry>(readRegistry);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="absolute inset-0 z-30 select-none"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.62) 100%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.2s ease',
      }}
    >
      {/* ── MARCO DE PANTALLA (borde retro) ── */}
      <div className="absolute inset-2 md:inset-4 pointer-events-none z-10"
           style={{
             border: FRAME_BORDER,
             outline: FRAME_OUTLINE,
             outlineOffset: '5px',
             boxShadow: 'inset 0 0 90px rgba(0,0,0,0.55)',
           }}>
        <FrameCorner pos="tl" />
        <FrameCorner pos="tr" />
        <FrameCorner pos="bl" />
        <FrameCorner pos="br" />
      </div>

      {/* ══════ PORTADA ══════ */}
      {page === 'main' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          {visible && (
            <div className="text-center mb-8 md:mb-10"
                 style={{
                   transform: visible ? 'scale(1)' : 'scale(0.88)',
                   opacity: visible ? 1 : 0,
                   transition: 'all 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s',
                 }}>
              {/* ── TÍTULO ── */}
              <div className="px-8 py-7 md:px-16 md:py-10">

                <h2 style={{
                  fontSize: 'clamp(3rem, 10.5vw, 7rem)',
                  fontFamily: 'Georgia, "Palatino Linotype", serif',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '0.14em',
                  ...GOLD_TEXT,
                }}>
                  Garden
                </h2>

                <div className="flex items-center justify-center gap-4 my-3"
                     style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1s' }}>
                  <div style={{
                    height: 2,
                    width: visible ? 50 : 0,
                    background: 'linear-gradient(90deg, transparent, rgba(220,190,110,0.6))',
                    transition: 'width 1.2s ease 1s',
                  }} />
                  <p>
                    <span style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)',
                      fontStyle: 'italic',
                      fontWeight: 500,
                      color: gold(0.7),
                      letterSpacing: '0.25em',
                      textShadow: SERIF_SHADOW,
                    }}>
                      of
                    </span>
                  </p>
                  <div style={{
                    height: 2,
                    width: visible ? 50 : 0,
                    background: 'linear-gradient(270deg, transparent, rgba(220,190,110,0.6))',
                    transition: 'width 1.2s ease 1s',
                  }} />
                </div>

                <h2 style={{
                  fontSize: 'clamp(2.4rem, 8.5vw, 5.8rem)',
                  fontFamily: 'Georgia, serif',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '0.24em',
                  ...GOLD_TEXT,
                }}>
                  Eden
                </h2>

                <p className="mt-5 text-sm md:text-base italic"
                   style={{
                     fontFamily: 'Georgia, serif',
                     color: gold(0.6),
                     letterSpacing: '0.1em',
                     textShadow: SERIF_SHADOW,
                     opacity: visible ? 1 : 0,
                     transition: 'opacity 1s ease 1.4s',
                   }}>
                  The first morning of man
                </p>
              </div>
            </div>
          )}

          {/* Ornamento sobre el botón */}
          <div className="flex items-center justify-center gap-3 my-3"
               style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.6s' }}>
            <span style={{ color: gold(0.5), fontSize: '0.7rem', textShadow: '0 0 8px rgba(255,200,110,0.5)' }}>✦</span>
            <span style={{ color: gold(0.5), fontSize: '0.5rem' }}>✦</span>
            <span style={{ color: gold(0.5), fontSize: '0.7rem', textShadow: '0 0 8px rgba(255,200,110,0.5)' }}>✦</span>
          </div>

          {/* Botón comenzar */}
          <button
            onClick={onStart}
            className="px-14 py-3.5 tracking-[0.4em] text-sm md:text-base font-mono uppercase
                     active:scale-95 transition-all"
            style={{
              color: '#241800',
              fontWeight: 700,
              background: 'linear-gradient(180deg, #ffe9a8 0%, #f5c34a 50%, #d99a1f 100%)',
              border: '1px solid rgba(255,220,140,0.75)',
              boxShadow: '0 0 22px rgba(255,190,80,0.45), inset 0 1px 0 rgba(255,255,255,0.6)',
              textShadow: '0 1px 0 rgba(255,255,255,0.4)',
              opacity: visible ? 1 : 0,
              transition: 'opacity 1s ease 1.8s, transform 0.15s ease, box-shadow 0.25s ease',
              animation: visible ? 'startBlink 2.4s ease-in-out 2.6s infinite' : 'none',
            }}
          >
            Comenzar
          </button>

          {registry.bestScore > 0 && (
            <p className="mt-4 text-[10px] font-mono tracking-[0.3em]"
               style={{
                 color: gold(0.4),
                 textShadow: SERIF_SHADOW,
                 opacity: visible ? 1 : 0,
                 transition: 'opacity 1s ease 2.1s',
               }}>
              MEJOR SCORE — {registry.bestScore.toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* ══════ REGISTROS - RECUERDOS ══════ */}
      {page === 'memories' && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="w-full max-w-sm">
            <p className="text-center text-xs tracking-[0.5em] mb-5"
               style={{ fontFamily: 'Georgia, serif', fontWeight: 500, color: gold(0.65), textShadow: SERIF_SHADOW }}>
              RECUERDOS
            </p>

            <div className="space-y-3 mb-6">
              {MEMORIES.filter(m => !!registry[m.key]).map((m, i) => (
                <div key={i} className="py-2.5 px-3"
                     style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <p>
                    <span className="text-[11px]" style={{ color: 'rgba(255,230,180,0.85)' }}>
                      ✦{' '}
                    </span>
                    <span className="text-[13px]" style={{
                      fontFamily: 'Georgia, serif',
                      fontWeight: 600,
                      color: 'rgba(255,240,210,0.9)',
                      textShadow: '0 0 2px rgba(0,0,0,0.6)',
                    }}>
                      {m.title}
                    </span>
                  </p>
                  <p className="text-[11px] italic ml-5"
                     style={{
                       fontFamily: 'Georgia, serif',
                       color: 'rgba(255,235,200,0.6)',
                       textShadow: '0 0 1px rgba(0,0,0,0.5)',
                     }}>
                    {m.desc}
                  </p>
                </div>
              ))}
              {MEMORIES.filter(m => !!registry[m.key]).length === 0 && (
                <p className="text-center text-[11px] italic py-4"
                   style={{ fontFamily: 'Georgia, serif', color: 'rgba(255,235,200,0.35)' }}>
                  Aún no hay recuerdos...
                </p>
              )}
            </div>

            {/* Score más alto */}
            <div className="text-center mb-5 py-2"
                 style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[10px] tracking-[0.3em] mb-1" style={{ color: 'rgba(255,235,200,0.45)' }}>
                MEJOR SCORE
              </p>
              <p className="text-[14px] font-mono"
                 style={{ color: 'rgba(255,240,210,0.85)', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                {registry.bestScore.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════ REGISTROS - DATOS ══════ */}
      {page === 'stats' && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="w-full max-w-xs">
            <p className="text-center text-xs tracking-[0.5em] mb-5"
               style={{ fontFamily: 'Georgia, serif', fontWeight: 500, color: gold(0.65), textShadow: SERIF_SHADOW }}>
              DATOS
            </p>

            <div className="space-y-2 mb-5">
              {([
                ['Partidas', registry.gamesPlayed],
                ['Distancia', `${Math.floor(registry.distanceWalked)}m`],
                ['Tiempo jugado', `${Math.floor(registry.timePlayed / 60)}min`],
                ['Saltos', registry.jumps],
                ['Sprints', registry.sprints],
                ['Saciedad máx.', registry.food],
                ['Descubrimientos', registry.discoveries],
              ] as [string, string | number][]).map(([label, val], i) => (
                <p key={i} className="flex justify-between">
                  <span className="text-[11px]"
                        style={{ fontFamily: 'Georgia, serif', color: gold(0.45), textShadow: SERIF_SHADOW }}>
                    {label}
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: gold(0.65), textShadow: SERIF_SHADOW }}>
                    {val}
                  </span>
                </p>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ══════ MAPA DEL JARDÍN ══════ */}
      {page === 'map' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <p className="text-center text-xs tracking-[0.5em] mb-4"
             style={{ fontFamily: 'Georgia, serif', fontWeight: 500, color: gold(0.65), textShadow: SERIF_SHADOW }}>
            EL JARDÍN
          </p>
          <div
            className="max-w-[82vw] max-h-[62vh] overflow-hidden"
            style={{
              border: `1px solid ${gold(0.35)}`,
              boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
            }}
          >
            <img
              src="images/mapa-jardin-eden.png"
              alt="Mapa del jardín del Edén visto desde arriba"
              className="block w-full h-full object-contain"
              style={{ maxHeight: '62vh' }}
            />
          </div>
        </div>
      )}

      {/* ══════ NAVEGACIÓN INFERIOR ══════ */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6">
        <button
          onClick={() => setPage('main')}
          className="text-[10px] font-mono tracking-[0.3em] uppercase transition-colors"
          style={{
            color: gold(page === 'main' ? 0.9 : 0.35),
            textShadow: SERIF_SHADOW,
            borderBottom: page === 'main' ? `1px solid ${gold(0.6)}` : '1px solid transparent',
            paddingBottom: 2,
          }}
        >
          Inicio
        </button>
        <button
          onClick={() => setPage('memories')}
          className="text-[10px] font-mono tracking-[0.3em] uppercase transition-colors"
          style={{
            color: gold(page === 'memories' ? 0.9 : 0.35),
            textShadow: SERIF_SHADOW,
            borderBottom: page === 'memories' ? `1px solid ${gold(0.6)}` : '1px solid transparent',
            paddingBottom: 2,
          }}
        >
          Recuerdos
        </button>
        <button
          onClick={() => setPage('stats')}
          className="text-[10px] font-mono tracking-[0.3em] uppercase transition-colors"
          style={{
            color: gold(page === 'stats' ? 0.9 : 0.35),
            textShadow: SERIF_SHADOW,
            borderBottom: page === 'stats' ? `1px solid ${gold(0.6)}` : '1px solid transparent',
            paddingBottom: 2,
          }}
        >
          Datos
        </button>
        <button
          onClick={() => setPage('map')}
          className="text-[10px] font-mono tracking-[0.3em] uppercase transition-colors"
          style={{
            color: gold(page === 'map' ? 0.9 : 0.35),
            textShadow: SERIF_SHADOW,
            borderBottom: page === 'map' ? `1px solid ${gold(0.6)}` : '1px solid transparent',
            paddingBottom: 2,
          }}
        >
          Mapa
        </button>
      </div>

      <style>{`
        @keyframes startBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}
