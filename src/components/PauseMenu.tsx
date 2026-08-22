interface PauseMenuProps {
  onResume: () => void;
  onExit: () => void;
}

// Letras doradas elegantes: degradado + borde fino + brillo suave
const GOLD_TEXT: React.CSSProperties = {
  backgroundImage: 'linear-gradient(180deg, #fffbe6 0%, #ffe9a8 25%, #f5c34a 50%, #d99a1f 80%, #a8740e 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextStroke: '1px rgba(58,36,4,0.6)',
  filter: 'drop-shadow(0 2px 1px rgba(40,24,2,0.85)) drop-shadow(0 0 16px rgba(255,195,80,0.35))',
};

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const s: React.CSSProperties = {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#ffd166',
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

export default function PauseMenu({ onResume, onExit }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/85 z-50">
      {/* ── MARCO DE PANTALLA ── */}
      <div className="absolute inset-2 md:inset-4 pointer-events-none"
           style={{
             border: '2px solid rgba(224,190,120,0.7)',
             outline: '1px solid rgba(224,190,120,0.3)',
             outlineOffset: '5px',
             boxShadow: 'inset 0 0 90px rgba(0,0,0,0.55)',
           }}>
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />
      </div>

      <div className="relative text-center px-10 py-10 md:px-16 md:py-12 font-mono">
        <h2 className="text-4xl md:text-5xl font-bold tracking-widest"
            style={{
              fontFamily: 'Georgia, "Palatino Linotype", serif',
              ...GOLD_TEXT,
            }}>
          PAUSED
        </h2>

        <div className="space-y-4 text-white text-sm mt-9">
          <button
            onClick={onResume}
            className="block w-52 mx-auto py-3 tracking-[0.3em] uppercase font-bold
                       active:scale-95 transition-all"
            style={{
              color: '#241800',
              background: 'linear-gradient(180deg, #ffe9a8 0%, #f5c34a 50%, #d99a1f 100%)',
              border: '1px solid rgba(255,220,140,0.75)',
              boxShadow: '0 0 18px rgba(255,190,80,0.4), inset 0 1px 0 rgba(255,255,255,0.6)',
              textShadow: '0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            CONTINUE
          </button>
          <button
            onClick={onExit}
            className="block w-52 mx-auto py-3 tracking-[0.3em] uppercase font-bold
                       text-white/70 hover:text-white active:scale-95 transition-all"
            style={{
              background: 'transparent',
              border: '2px solid rgba(224,190,120,0.55)',
              textShadow: '2px 2px 0 rgba(0,0,0,0.8)',
            }}
          >
            SALIR
          </button>
        </div>
      </div>
    </div>
  );
}
