import { useMemo, useState, useEffect } from 'react';
import { EDEN_LANDMARKS } from '../game/worldLayout';

interface HUDProps {
  score: number;
  food: number;
  prompt: string | null;
  compassHeading: number;
  playerPos?: { x: number; z: number };
  onPause: () => void;
  onSprint: (active: boolean) => void;
  onJump: () => void;
  onInspect: () => void;
  showControls: boolean;
  showExploreHint: boolean;
}

const COMPASS_POINTS = [
  { label: 'N', deg: 0, major: true },
  { label: 'NE', deg: 45, major: false },
  { label: 'E', deg: 90, major: true },
  { label: 'SE', deg: 135, major: false },
  { label: 'S', deg: 180, major: true },
  { label: 'SW', deg: 225, major: false },
  { label: 'W', deg: 270, major: true },
  { label: 'NW', deg: 315, major: false },
];

export default function HUD({
  score,
  food,
  prompt,
  compassHeading,
  playerPos = { x: 0, z: -20 },
  onPause,
  onSprint,
  onJump,
  onInspect,
  showControls,
  showExploreHint,
}: HUDProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    setIsTouchDevice(hasTouch && !isFinePointer);
  }, []);

  const distToTree = useMemo(() => {
    return Math.floor(Math.sqrt(playerPos.x * playerPos.x + playerPos.z * playerPos.z));
  }, [playerPos.x, playerPos.z]);

  const treeAngleDeg = useMemo(() => {
    const angle = (Math.atan2(-playerPos.x, -playerPos.z) * 180 / Math.PI + 360) % 360;
    return angle;
  }, [playerPos.x, playerPos.z]);

  const treeRelAngle = useMemo(() => {
    let diff = treeAngleDeg - compassHeading;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return diff;
  }, [treeAngleDeg, compassHeading]);

  const closestLandmark = useMemo(() => {
    let minD = Number.POSITIVE_INFINITY;
    let closest: typeof EDEN_LANDMARKS[number] | null = null;
    for (const lm of EDEN_LANDMARKS) {
      const dx = playerPos.x - lm.x;
      const dz = playerPos.z - lm.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d < minD) {
        minD = d;
        closest = lm;
      }
    }
    return closest && minD < 45 ? { name: closest.name, dist: Math.floor(minD) } : null;
  }, [playerPos.x, playerPos.z]);

  return (
    <>
      {/* ══════ HUD CLÁSICO DEL EDÉN ══════ */}
      <div className="absolute inset-0 pointer-events-none z-40 select-none font-serif">
        {/* ── TOP LEFT: PLACA DE PAPIRO (SCORE Y SACIEDAD) ── */}
        <div
          className="absolute top-4 left-4 flex items-center gap-2.5 pointer-events-auto"
          style={{ filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.65))' }}
        >
          {/* Orbe de Saciedad */}
          <div
            className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-[#5a3814]"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #fffdf7 0%, #f6ebd0 45%, #deb982 100%)',
              boxShadow: 'inset 0 0 10px rgba(120, 75, 20, 0.35), 0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            {/* Nivel fluido esmeralda */}
            <div
              className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#1b4332] via-[#2d6a4f] to-[#52b788] opacity-85 transition-all duration-300"
              style={{ height: `${Math.min(100, Math.max(15, (food / 8) * 100))}%` }}
            />

            <div className="relative z-10 flex flex-col items-center justify-center">
              <span className="text-[8px] font-mono font-bold tracking-widest text-[#2d1b08] uppercase -mb-0.5">
                SAC
              </span>
              <span
                className="text-sm font-bold font-mono text-[#1f1003] leading-none"
                style={{ textShadow: '0 1px 0 rgba(255,255,255,0.85)' }}
              >
                {food}
              </span>
            </div>
          </div>

          {/* Placa de Score en Papiro (Estilo Botón del Título) */}
          <div className="flex flex-col">
            <div
              className="relative px-4 py-1.5 rounded-xs flex items-center gap-2 shadow-xl"
              style={{
                background: 'linear-gradient(180deg, #fffdf7 0%, #f8eccf 35%, #edd7ad 75%, #dbbe8a 100%)',
                border: '2px solid #5a3814',
                outline: '1px dashed rgba(120, 75, 25, 0.45)',
                outlineOffset: '-3.5px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4), inset 0 0 10px rgba(180, 130, 60, 0.2)',
              }}
            >
              <span className="text-[11px] font-serif font-bold tracking-[0.2em] uppercase text-[#73180e]">
                SCORE
              </span>
              <span
                className="text-xs sm:text-sm font-mono font-bold text-[#2c1606] tracking-wider"
                style={{ textShadow: '0 1px 0 rgba(255,255,255,0.9)' }}
              >
                {score.toString().padStart(6, '0')}
              </span>
            </div>

            {closestLandmark && (
              <span
                className="text-[10px] font-serif italic text-amber-100 mt-1 ml-1"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8)' }}
              >
                Próximo: {closestLandmark.name} ({closestLandmark.dist}m)
              </span>
            )}
          </div>
        </div>

        {/* ── TOP CENTER: BRÚJULA SUAVE Y LEVE SIN CINTA LARGA OSCURA ── */}
        {showControls && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
            {/* Brújula sin fondo oscuro, solo puntos cardinales flotantes */}
            <div
              className="relative px-4 py-1 flex items-center gap-5 text-xs"
              style={{ minWidth: 240, justifyContent: 'center' }}
            >
              {COMPASS_POINTS.map((pt, i) => {
                let diff = pt.deg - compassHeading;
                while (diff > 180) diff -= 360;
                while (diff < -180) diff += 360;
                if (Math.abs(diff) > 75) return null;
                const isCenter = Math.abs(diff) < 18;

                return (
                  <span
                    key={i}
                    className={`font-serif transition-all ${
                      isCenter
                        ? 'text-amber-200 font-bold scale-125 drop-shadow-[0_0_10px_rgba(255,215,100,0.95)]'
                        : pt.major
                        ? 'text-amber-100/80 font-semibold text-[11px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]'
                        : 'text-amber-200/40 text-[10px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                    }`}
                  >
                    {pt.label}
                  </span>
                );
              })}

              {/* Baliza sutil del Árbol */}
              {Math.abs(treeRelAngle) < 70 && (
                <div
                  className="absolute text-emerald-300 text-xs animate-pulse"
                  style={{
                    left: `calc(50% + ${(treeRelAngle / 70) * 95}px)`,
                    transform: 'translateX(-50%)',
                    filter: 'drop-shadow(0 0 6px rgba(110, 231, 183, 0.95))',
                  }}
                  title={`Árbol del Conocimiento (${distToTree}m)`}
                >
                  🌳
                </div>
              )}
            </div>

            {/* Aguja dorada flotante */}
            <div
              className="w-1.5 h-1.5 -mt-0.5 rounded-b-xs"
              style={{
                background: '#ffd166',
                boxShadow: '0 0 6px #ffd166, 0 1px 3px rgba(0,0,0,0.9)',
              }}
            />

            <span
              className="text-[9px] font-serif tracking-[0.25em] text-amber-200/85 uppercase mt-0.5"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8)' }}
            >
              Árbol Central: {distToTree}m
            </span>
          </div>
        )}

        {/* ── TOP RIGHT: BOTÓN PAUSA EN PAPIRO (Estilo Botón del Título) ── */}
        <div className="absolute top-4 right-4 pointer-events-auto">
          <button
            onClick={onPause}
            className="group relative px-5 py-1.5 rounded-xs flex items-center justify-center cursor-pointer active:scale-95 hover:scale-[1.03] transition-all shadow-xl"
            style={{
              background: 'linear-gradient(180deg, #fffdf7 0%, #f8eccf 35%, #edd7ad 75%, #dbbe8a 100%)',
              border: '2px solid #5a3814',
              outline: '1px dashed rgba(120, 75, 25, 0.45)',
              outlineOffset: '-3.5px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4), inset 0 0 10px rgba(180, 130, 60, 0.2)',
            }}
          >
            <span
              className="text-xs font-serif font-bold tracking-[0.22em] uppercase text-[#73180e] group-hover:text-[#9c1f11] transition-colors"
              style={{
                fontFamily: '"Cinzel", "Palatino Linotype", "Book Antiqua", "Georgia", serif',
                textShadow: '0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              PAUSA
            </span>
          </button>
        </div>

        {/* ── CENTER: CRUZ DORADA SEMITRANSPARENTE (PUNTERO) ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 opacity-40">
          <div className="relative w-3.5 h-3.5 flex items-center justify-center">
            <div className="absolute w-3.5 h-px bg-[#ffd166] shadow-[0_0_4px_#ffd166]" />
            <div className="absolute h-3.5 w-px bg-[#ffd166] shadow-[0_0_4px_#ffd166]" />
            <div className="w-0.5 h-0.5 bg-amber-100 rounded-full" />
          </div>
        </div>

        {/* ── CENTER: PROMPT DE INTERACCIÓN FLOTANTE LIMPIO SIN FONDO ── */}
        {showControls && prompt && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-7 pointer-events-none flex items-center gap-2 transition-all duration-150">
            <span
              className="text-xs font-mono font-bold tracking-widest text-[#ffd166] uppercase"
              style={{
                textShadow: '0 2px 6px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.95), 1px 1px 2px #000',
              }}
            >
              [E]
            </span>
            <span
              className="text-sm md:text-base font-serif font-bold tracking-wider text-amber-100 whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,1)]"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,1), 0 0 18px rgba(0,0,0,0.95), 1px 1px 3px rgba(0,0,0,1)',
                WebkitTextStroke: '0.4px rgba(0,0,0,0.85)',
              }}
            >
              {prompt}
            </span>
          </div>
        )}

        {/* ── BOTTOM CENTER: HINT EXPLORATORIO ── */}
        {showControls && showExploreHint && !prompt && (
          <div
            className="absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-black/60 border border-amber-300/40 text-amber-200 text-xs text-center font-serif italic tracking-widest"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.9)',
              animation: 'ps2fade 2.5s ease-in-out infinite',
            }}
          >
            ✦ Explora los senderos del Edén · Descubre los 4 Ríos Sagrados ✦
          </div>
        )}
      </div>

      {/* ── CONTROLES TÁCTILES: SOLO EN DISPOSITIVOS TÁCTILES REALES (NUNCA EN PC) ── */}
      {showControls && isTouchDevice && (
        <>
          <div
            className="absolute right-3 z-40 flex flex-col gap-2.5 pointer-events-auto"
            style={{ bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))' }}
          >
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onInspect();
              }}
              className="w-16 h-16 rounded-full border-2 border-amber-400/80 bg-black/60 flex flex-col items-center justify-center active:bg-amber-500/30 active:scale-95 transition-all select-none shadow-xl"
              style={{ touchAction: 'none' }}
            >
              <span className="text-amber-300 text-[9px] font-mono font-bold tracking-wider">
                {prompt ? 'ACT' : 'LOOK'}
              </span>
              <span className="text-[11px] text-amber-200">✦</span>
            </button>

            <button
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onJump();
              }}
              className="w-16 h-16 rounded-full border-2 border-white/60 bg-black/60 flex items-center justify-center active:bg-white/30 active:scale-95 transition-all select-none shadow-xl"
              style={{ touchAction: 'none' }}
            >
              <span className="text-white text-xs font-mono font-bold tracking-wider">
                JUMP
              </span>
            </button>

            <button
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSprint(true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSprint(false);
              }}
              onTouchCancel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSprint(false);
              }}
              className="w-16 h-16 rounded-full border-2 border-emerald-400/70 bg-black/60 flex items-center justify-center active:bg-emerald-500/30 active:scale-95 transition-all select-none shadow-xl"
              style={{ touchAction: 'none' }}
            >
              <span className="text-emerald-300 text-xs font-mono font-bold tracking-wider">
                RUN
              </span>
            </button>
          </div>

          <div
            className="md:hidden absolute left-3 pointer-events-none z-30"
            style={{ bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="w-20 h-20 border-2 border-amber-300/30 bg-black/30 rounded-full flex items-center justify-center">
              <div className="w-7 h-7 border border-amber-200/50 rounded-full" />
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes ps2fade {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
