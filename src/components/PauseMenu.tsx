interface PauseMenuProps {
  onResume: () => void;
  onExit: () => void;
}

export default function PauseMenu({ onResume, onExit }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="text-center space-y-8 px-4 font-mono">
        <h2 className="text-4xl font-bold text-white tracking-widest"
            style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.5)' }}>
          PAUSED
        </h2>
        <div className="space-y-3 text-white text-sm">
          <button
            onClick={onResume}
            className="block w-48 mx-auto py-2 border border-white/50 hover:bg-white/10 transition-colors"
            style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}
          >
            CONTINUE
          </button>
          <button
            onClick={onExit}
            className="block w-48 mx-auto py-2 border border-white/30 hover:bg-white/10 transition-colors text-white/70"
            style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}
          >
            SALIR
          </button>
        </div>
      </div>
    </div>
  );
}
