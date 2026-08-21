interface GameOverScreenProps {
  score: number;
  discoveries: number;
  onRestart: () => void;
  highScores: number[];
}

export default function GameOverScreen({ score, discoveries, onRestart, highScores }: GameOverScreenProps) {
  const isNewHighScore = highScores.length === 0 || score > Math.min(...highScores);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
      <div className="text-center space-y-8 px-4 font-mono max-w-md">
        {/* Game Over */}
        <div className="space-y-4">
          <h2 className="text-5xl font-bold text-white tracking-widest"
              style={{ textShadow: '4px 4px 0 rgba(0,0,0,0.5)' }}>
            GAME OVER
          </h2>

          {isNewHighScore && highScores.length > 0 && (
            <div className="text-yellow-400 text-sm tracking-wider"
                 style={{ animation: 'ps2blink 1s ease-in-out infinite' }}>
              NEW RECORD
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="text-white text-sm space-y-2">
          <div className="flex justify-between px-8">
            <span>SCORE</span>
            <span>{score.toString().padStart(6, '0')}</span>
          </div>
          <div className="flex justify-between px-8">
            <span>ITEMS</span>
            <span>{discoveries.toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* High Scores */}
        {highScores.length > 0 && (
          <div className="text-white/60 text-xs space-y-1 pt-4">
            <div className="text-white/80 mb-2">RANKING</div>
            {highScores.slice(0, 5).map((s, i) => (
              <div
                key={i}
                className={`flex justify-between px-12 ${s === score ? 'text-yellow-400' : ''}`}
              >
                <span>{(i + 1)}.</span>
                <span>{s.toString().padStart(6, '0')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Restart */}
        <button
          onClick={onRestart}
          className="text-white text-sm tracking-widest py-2 px-8 border border-white/50
                   hover:bg-white/10 transition-colors mt-6"
          style={{
            textShadow: '2px 2px 0 rgba(0,0,0,0.8)',
            animation: 'ps2blink 1.5s ease-in-out infinite'
          }}
        >
          PRESS START
        </button>
      </div>

      <style>{`
        @keyframes ps2blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
