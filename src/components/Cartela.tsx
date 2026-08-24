import type { ReactNode } from 'react';

interface CartelaProps {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  size?: 'hud' | 'pin';
  className?: string;
}

/** Cartela de pergamino: cinta con pliegues, el nombre queda en el centro. */
export function Cartela({ children, onClick, selected, size = 'hud', className = '' }: CartelaProps) {
  const pin = size === 'pin';
  const Tag = onClick ? 'button' : 'div';
  const fill = selected ? '#f6d56a' : '#f8ecd0';
  const fold = selected ? '#c49220' : '#d4b078';
  const ink = selected ? '#6a140c' : '#3d2410';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`relative isolate inline-flex items-center justify-center ${
        onClick ? 'cursor-pointer active:scale-95 hover:brightness-[1.03] transition-transform' : ''
      } ${className}`}
      style={{
        height: pin ? 20 : 40,
        minWidth: pin ? 52 : 148,
        filter: 'drop-shadow(0 2px 3px rgba(30,14,4,0.45))',
      }}
    >
      <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 200 40" preserveAspectRatio="none">
        <path d="M16 6 L4 20 L16 34 L10 20 Z" fill={fold} />
        <path d="M184 6 L196 20 L184 34 L190 20 Z" fill={fold} />
        <path
          d="M22 7 C 40 4, 160 4, 178 7 L 188 14 L 178 20 L 188 26 L 178 33 C 160 36, 40 36, 22 33 L 12 26 L 22 20 L 12 14 Z"
          fill={fill}
          stroke={ink}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M30 11 C 70 8, 130 8, 170 11" fill="none" stroke="#fffaf0" strokeWidth="1.1" opacity="0.55" />
        <path d="M30 29 C 70 32, 130 32, 170 29" fill="none" stroke="#8a5a28" strokeWidth="0.6" opacity="0.28" />
      </svg>
      <span
        className={`relative z-10 font-serif font-bold leading-none whitespace-nowrap text-[#2a1608] ${
          pin ? 'px-3.5 text-[8px] md:text-[9px]' : 'px-8 text-[12px] tracking-[0.14em]'
        }`}
      >
        {children}
      </span>
    </Tag>
  );
}
