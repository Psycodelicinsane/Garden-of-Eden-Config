interface HighScoreTableProps {
  scores: number[];
  currentScore?: number;
}

export default function HighScoreTable({ scores, currentScore }: HighScoreTableProps) {
  return (
    <div className="bg-black/70 border-2 border-yellow-500/50 p-6 rounded-lg backdrop-blur-sm">
      <h3 className="text-yellow-400 font-bold text-xl mb-4 text-center">
        ✦ TOP PUNTUACIONES ✦
      </h3>
      <div className="space-y-2">
        {scores.slice(0, 10).map((score, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-3 rounded-lg font-mono ${
              score === currentScore
                ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300'
                : 'bg-white/5 text-white/80'
            }`}
          >
            <span className="text-white/60 font-bold">#{index + 1}</span>
            <span className="text-lg font-bold">{score.toLocaleString()}</span>
          </div>
        ))}
        {scores.length === 0 && (
          <p className="text-white/50 text-center py-4">
            No hay puntuaciones aún
          </p>
        )}
      </div>
    </div>
  );
}
