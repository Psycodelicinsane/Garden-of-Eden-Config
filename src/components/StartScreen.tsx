import { useEffect, useState } from 'react';

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
  highScores: number[];
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

function readRegistry(): Registry {
  try {
    const saved = localStorage.getItem('edenRegistry');
    return saved ? { ...DEFAULT_REGISTRY, ...JSON.parse(saved) } : { ...DEFAULT_REGISTRY };
  } catch {
    return { ...DEFAULT_REGISTRY };
  }
}

export default function StartScreen({ onStart, highScores }: Props) {
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
      {/* ══════ PORTADA ══════ */}
      {page === 'main' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          {visible && (
            <div className="text-center mb-8 md:mb-10">
              <p style={{
                transform: visible ? 'scale(1)' : 'scale(0.85)',
                transition: 'all 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s',
                opacity: visible ? 1 : 0,
              }}>
                <h2 style={{
                  fontSize: 'clamp(3.2rem, 11vw, 7.5rem)',
                  fontFamily: 'Georgia, "Palatino Linotype", serif',
                  fontWeight: 600,
                  lineHeight: 1,
                  color: '#f5e0a8',
                  letterSpacing: '0.12em',
                  textShadow: '0 3px rgba(245,220,160,0.35), 0 5px rgba(140,100,30,0.7), 0 8px 16px rgba(90,60,15,0.5), 0 0 80px rgba(0,0,0,0.6)',
                }}>
                  Garden
                </h2>
              </p>

              <div className="flex items-center justify-center gap-4 my-2"
                   style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1s' }}>
                <div style={{
                  height: 2,
                  width: visible ? 50 : 0,
                  background: 'linear-gradient(90deg, transparent, rgba(220,190,110,0.5))',
                  transition: 'width 1.2s ease 1s',
                }} />
                <p>
                  <span style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)',
                    fontStyle: 'italic',
                    fontWeight: 500,
                    color: gold(0.65),
                    letterSpacing: '0.25em',
                    textShadow: SERIF_SHADOW,
                  }}>
                    of
                  </span>
                </p>
                <div style={{
                  height: 2,
                  width: visible ? 50 : 0,
                  background: 'linear-gradient(270deg, transparent, rgba(220,190,110,0.5))',
                  transition: 'width 1.2s ease 1s',
                }} />
              </div>

              <p style={{
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'all 1.2s cubic-bezier(0.16,1,0.3,1) 0.5s',
                opacity: visible ? 1 : 0,
              }}>
                <h2 style={{
                  fontSize: 'clamp(2.5rem, 9vw, 6rem)',
                  fontFamily: 'Georgia, serif',
                  fontWeight: 600,
                  lineHeight: 1,
                  color: '#e8d098',
                  letterSpacing: '0.22em',
                  textShadow: '0 3px rgba(230,200,140,0.3), 0 5px rgba(120,80,25,0.6), 0 8px 14px rgba(70,45,10,0.45), 0 0 70px rgba(0,0,0,0.55)',
                }}>
                  Eden
                </h2>
              </p>

              <p className="mt-5 text-sm md:text-base italic"
                 style={{
                   fontFamily: 'Georgia, serif',
                   color: gold(0.55),
                   letterSpacing: '0.1em',
                   textShadow: SERIF_SHADOW,
                   opacity: visible ? 1 : 0,
                   transition: 'opacity 1s ease 1.4s',
                 }}>
                The first morning of man
              </p>
            </div>
          )}

          {/* Botón comenzar */}
          <button
            onClick={onStart}
            className="px-12 py-3 border tracking-[0.4em] text-sm md:text-base font-mono uppercase
                     hover:bg-[rgba(224,190,120,0.12)] active:scale-95 transition-all"
            style={{
              color: gold(0.95),
              borderColor: gold(0.45),
              textShadow: SERIF_SHADOW,
              opacity: visible ? 1 : 0,
              transition: 'opacity 1s ease 1.8s, background 0.2s ease, transform 0.1s ease',
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

            {highScores.length > 0 && (
              <div className="mb-5">
                <p className="text-center text-[10px] tracking-[0.3em] mb-2" style={{ color: gold(0.3) }}>
                  TOP SCORES
                </p>
                {highScores.slice(0, 5).map((s, i) => (
                  <p key={i} className="flex justify-between px-10">
                    <span className="text-[10px] font-mono" style={{ color: gold(0.3) }}>
                      {i + 1}.
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: gold(0.5) }}>
                      {s.toLocaleString()}
                    </span>
                  </p>
                ))}
              </div>
            )}
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
              src="/images/mapa-jardin-eden.png"
              alt="Mapa del jardín del Edén visto desde arriba"
              className="block w-full h-full object-contain"
              style={{ maxHeight: '62vh' }}
            />
          </div>
          <p className="mt-3 text-[10px] italic"
             style={{ fontFamily: 'Georgia, serif', color: gold(0.42), textShadow: SERIF_SHADOW }}>
            El árbol del conocimiento en el centro · el río al norte
          </p>
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
