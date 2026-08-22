interface HUDProps {
  score: number;
  food: number;
  onPause: () => void;
  onSprint: (active: boolean) => void;
  onJump: () => void;
  onInspect: () => void;
  showControls: boolean;
  showExploreHint: boolean;
}

export default function HUD({
  score,
  food,
  onPause,
  onSprint,
  onJump,
  onInspect,
  showControls,
  showExploreHint,
}: HUDProps) {
  return (
    <>
      {/* HUD estilo PS2 */}
      <div className="absolute inset-0 pointer-events-none z-40 font-mono">
        {/* Top left */}
        <div className="absolute top-3 left-3 text-white text-xs md:text-sm" style={{
          textShadow: '2px 2px 0 rgba(0,0,0,0.9), -1px -1px 0 rgba(0,0,0,0.6)'
        }}>
          <div className="mb-0.5">SCORE {score.toString().padStart(6, '0')}</div>
          <div>SACIEDAD {food.toString().padStart(2, '0')}</div>
        </div>

        {/* Top right - Pause */}
        <div className="absolute top-3 right-3">
          <button
            onClick={onPause}
            className="pointer-events-auto px-3 py-1.5 text-white text-xs border border-white/40
                     active:bg-white/20 transition-colors"
            style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}
          >
            MENU
          </button>
        </div>

        {/* Bottom center - Hint */}
        {showControls && showExploreHint && (
          <div className="absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 text-white text-xs text-center"
               style={{
                 textShadow: '2px 2px 0 rgba(0,0,0,0.9)',
                 animation: 'ps2fade 2s ease-in-out infinite'
               }}>
            EXPLORA EL JARDÍN
          </div>
        )}
      </div>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 opacity-60">
        <div className="relative w-4 h-4">
          <div className="absolute top-1/2 left-0 w-1.5 h-px bg-white -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-1.5 h-px bg-white -translate-y-1/2"></div>
          <div className="absolute left-1/2 top-0 w-px h-1.5 bg-white -translate-x-1/2"></div>
          <div className="absolute left-1/2 bottom-0 w-px h-1.5 bg-white -translate-x-1/2"></div>
        </div>
      </div>

      {/* Mobile action buttons — ocultos durante cinemáticas */}
      {showControls && (
        <>
          <div
            className="md:hidden absolute right-3 z-40 flex flex-col gap-2 pointer-events-auto"
            style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
          >
            {/* Inspect */}
            <button
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); onInspect(); }}
              className="w-16 h-16 rounded-full border-2 border-green-400/60 bg-green-400/10
                       flex items-center justify-center active:bg-green-400/30 active:scale-95
                       transition-all select-none"
              style={{ touchAction: 'none' }}
            >
              <span className="text-green-300 text-[10px] font-mono font-bold"
                    style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.8)' }}>
                LOOK
              </span>
            </button>

            {/* Jump */}
            <button
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); onJump(); }}
              className="w-16 h-16 rounded-full border-2 border-white/60 bg-white/10
                       flex items-center justify-center active:bg-white/30 active:scale-95
                       transition-all select-none"
              style={{ touchAction: 'none' }}
            >
              <span className="text-white text-xs font-mono font-bold"
                    style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.8)' }}>
                JUMP
              </span>
            </button>

            {/* Sprint */}
            <button
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); onSprint(true); }}
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onSprint(false); }}
              onTouchCancel={(e) => { e.preventDefault(); e.stopPropagation(); onSprint(false); }}
              className="w-16 h-16 rounded-full border-2 border-yellow-400/60 bg-yellow-400/10
                       flex items-center justify-center active:bg-yellow-400/30 active:scale-95
                       transition-all select-none"
              style={{ touchAction: 'none' }}
            >
              <span className="text-yellow-300 text-xs font-mono font-bold"
                    style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.8)' }}>
                RUN
              </span>
            </button>
          </div>

          {/* Mobile joystick indicator */}
          <div
            className="md:hidden absolute left-3 pointer-events-none z-30"
            style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="w-20 h-20 border-2 border-white/20 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border border-white/30 rounded-full"></div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes ps2fade {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
