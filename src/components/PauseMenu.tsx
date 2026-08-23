import type { CSSProperties } from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onExit: () => void;
}

const PARCHMENT_BG: CSSProperties = {
  backgroundColor: '#f7f1e1',
  backgroundImage: `
    radial-gradient(ellipse at 50% 50%, rgba(255, 253, 246, 0.98) 0%, rgba(247, 239, 218, 0.95) 70%, rgba(226, 210, 178, 0.97) 100%),
    repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(160, 130, 90, 0.03) 3px, rgba(160, 130, 90, 0.03) 4px)
  `,
  boxShadow: '0 25px 80px rgba(0,0,0,0.9), inset 0 0 60px rgba(160, 120, 60, 0.25)',
  border: '2px solid #5a3a18',
};

export default function PauseMenu({ onResume, onExit }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/75 z-50 p-4 select-none backdrop-blur-xs font-serif">
      <div
        className="relative w-full max-w-md p-6 sm:p-8 rounded-sm text-center flex flex-col items-center shadow-2xl"
        style={PARCHMENT_BG}
      >
        {/* Filigranas en esquinas */}
        <span className="absolute top-1.5 left-2 text-xs text-[#6e4e22]">❦</span>
        <span className="absolute top-1.5 right-2 text-xs text-[#6e4e22]">❦</span>
        <span className="absolute bottom-1.5 left-2 text-xs text-[#6e4e22]">❦</span>
        <span className="absolute bottom-1.5 right-2 text-xs text-[#6e4e22]">❦</span>

        {/* Título Noble */}
        <div className="mt-1 mb-2">
          <span className="text-[10px] font-serif uppercase tracking-[0.35em] text-[#7c5828] italic">
            — Códice del Génesis —
          </span>
          <h2
            className="text-2xl sm:text-3xl font-serif font-bold tracking-[0.2em] text-[#2c1606] uppercase mt-0.5"
            style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.9)' }}
          >
            MEDITATIO · PAUSA
          </h2>
        </div>

        {/* Cita del Génesis */}
        <div className="my-2 px-3 border-y border-[#a88a5d]/40 py-3 w-full">
          <p className="text-xs sm:text-sm font-serif italic text-[#553a1a] leading-relaxed">
            «Y reposó en el día séptimo de toda la obra que había hecho en la creación del huerto.»
          </p>
          <span className="text-[10px] font-serif tracking-widest text-[#7c5828] uppercase mt-1.5 block">
            — Génesis 2:2 —
          </span>
        </div>

        {/* Botones clásicos */}
        <div className="space-y-3 w-full max-w-xs mt-3 mb-1">
          {/* Botón Continuar */}
          <button
            autoFocus
            onClick={onResume}
            className="w-full py-3 px-6 rounded-xs cursor-pointer active:scale-95 hover:scale-[1.02] transition-all shadow-md"
            style={{
              background: 'linear-gradient(180deg, #96281b 0%, #7a1e14 60%, #5c140d 100%)',
              border: '1.5px solid #bd8230',
              outline: '1px solid rgba(255,220,130,0.3)',
              outlineOffset: 3,
              boxShadow: '0 4px 15px rgba(80, 20, 10, 0.4), inset 0 1px 0 rgba(255,255,255,0.35)',
              color: '#fdf8ee',
              fontFamily: '"Cinzel", "Palatino Linotype", "Georgia", serif',
              letterSpacing: '0.22em',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            <span className="text-xs sm:text-sm font-bold tracking-[0.24em] uppercase flex items-center justify-center gap-2">
              <span>⚜</span>
              <span>Continuar Travesía</span>
              <span>⚜</span>
            </span>
          </button>

          {/* Botón Guardar y Salir */}
          <button
            onClick={onExit}
            className="w-full py-2.5 px-6 rounded-xs cursor-pointer active:scale-95 hover:bg-[#e8d7bc] transition-all shadow-sm"
            style={{
              background: 'linear-gradient(180deg, #fffdf7 0%, #f8eccf 35%, #edd7ad 75%, #dbbe8a 100%)',
              border: '1.5px solid #5a3814',
              outline: '1px dashed rgba(120, 75, 25, 0.45)',
              outlineOffset: '-3.5px',
              color: '#73180e',
              fontFamily: '"Cinzel", "Palatino Linotype", "Georgia", serif',
              letterSpacing: '0.2em',
            }}
          >
            <span className="text-xs font-bold tracking-[0.22em] uppercase">
              💾 Guardar y Salir
            </span>
          </button>
        </div>

        {/* Adorno inferior */}
        <div className="text-[10px] text-[#8a6838] opacity-75 mt-3 font-serif italic">
          ❧ Jardín del Edén · Progreso Guardado Localmente ❧
        </div>
      </div>
    </div>
  );
}
