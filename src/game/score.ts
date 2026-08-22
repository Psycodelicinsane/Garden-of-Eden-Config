export type ScoreListener = (score: number) => void;

/**
 * Publica el score entero solo cuando difiere del último valor enviado.
 * Devuelve el nuevo valor recordado para que el llamador lo conserve.
 */
export function emitScoreIfChanged(
  score: number,
  lastSentScore: number,
  onChange: ScoreListener,
): number {
  const visibleScore = Math.floor(score);
  if (visibleScore === lastSentScore) return lastSentScore;
  onChange(visibleScore);
  return visibleScore;
}
