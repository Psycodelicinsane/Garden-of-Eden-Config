import { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import IntroSplash from './components/IntroSplash';
import StartScreen from './components/StartScreen';
import HUD from './components/HUD';
import PauseMenu from './components/PauseMenu';
import AwakeningTitle from './components/AwakeningTitle';
import AdamThought from './components/AdamThought';
import CinematicOverlay from './components/CinematicOverlay';
import ForbiddenTreeCinematic from './components/ForbiddenTreeCinematic';

export type GameState = 'start' | 'cinematic' | 'playing' | 'paused';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine>(null);
  const gameStateRef = useRef<GameState>('start');
  const showIntroRef = useRef(true);
  const [gameState, setGameState] = useState<GameState>('start');
  const [showIntro, setShowIntro] = useState(true);
  const [adminBootToGameplay, setAdminBootToGameplay] = useState(false);
  const [score, setScore] = useState(0);
  const [foodCount, setFoodCount] = useState(0);
  const [cinematicProgress, setCinematicProgress] = useState(0);
  const [showAwakening, setShowAwakening] = useState(false);
  const [showForbiddenTree, setShowForbiddenTree] = useState(false);
  const [adamThought, setAdamThought] = useState<{ text: string; key: number } | null>(null);

  useEffect(() => {
    gameStateRef.current = gameState;
    showIntroRef.current = showIntro;
  }, [gameState, showIntro]);

  // Crear el motor UNA sola vez al montar.
  // Durante la intro solo carga el jardín en memoria; no arranca el loop del título aún.
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onStateChange: setGameState,
      onScoreUpdate: setScore,
      onFoodUpdate: setFoodCount,
      onCinematicUpdate: setCinematicProgress,
      onForbiddenTree: () => setShowForbiddenTree(true),
      onAdamThought: (text: string) => setAdamThought({ text, key: Date.now() }),
    });

    gameEngineRef.current = engine;
    engine.init();

    return () => { engine.dispose(); };
  }, []);

  // Cuando termina la intro, recién ahí arranca la escena viva del título.
  useEffect(() => {
    if (!showIntro && !adminBootToGameplay && gameState === 'start') {
      gameEngineRef.current?.showTitleScreen();
    }
  }, [showIntro, adminBootToGameplay, gameState]);

  // Si el admin activó boot directo muy pronto, asegurar el salto al gameplay
  useEffect(() => {
    if (adminBootToGameplay && gameEngineRef.current) {
      gameEngineRef.current.skipCinematic();
      setGameState('playing');
      setCinematicProgress(1);
    }
  }, [adminBootToGameplay]);

  const handleIntroEnd = () => setShowIntro(false);

  const handleStart = () => {
    setGameState('cinematic');
    setCinematicProgress(0);
    gameEngineRef.current?.startGame();
  };

  const handlePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      gameEngineRef.current?.pause();
    }
  };

  const handleResume = () => {
    if (gameState === 'paused') {
      setGameState('playing');
      gameEngineRef.current?.resume();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentState = gameStateRef.current;
      const introVisible = showIntroRef.current;

      if (e.key === 'Escape' && currentState === 'playing') {
        setGameState('paused');
        gameEngineRef.current?.pause();
      } else if (e.key === 'Escape' && currentState === 'paused') {
        setGameState('playing');
        gameEngineRef.current?.resume();
      }

      if (e.key === 'p' || e.key === 'P') {
        if (introVisible || currentState === 'start' || currentState === 'cinematic') {
          setAdminBootToGameplay(true);
          setShowIntro(false);
          setGameState('playing');
          setCinematicProgress(1);
          gameEngineRef.current?.skipCinematic();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      try {
        const reg = JSON.parse(localStorage.getItem('edenRegistry') || '{}');
        if (!reg.memoryAwakening) {
          setShowAwakening(true);
          reg.memoryAwakening = true;
          reg.hasSeenAwakening = true;
          localStorage.setItem('edenRegistry', JSON.stringify(reg));
          setTimeout(() => setShowAwakening(false), 7000);
        }
      } catch { /* empty */ }
    }
  }, [gameState]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Canvas 3D — siempre visible, carga desde el primer segundo */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none z-0"
        style={{ touchAction: 'none', opacity: 1, transition: 'opacity 1.8s ease-out' }}
      />

      {/* Intro PSYCODELICINSANE — overlay sobre el jardín */}
      {showIntro && (
        <IntroSplash onEnd={handleIntroEnd} />
      )}

      <AwakeningTitle show={showAwakening} />

      {/* Reflexión de Adán — pasamos objeto {text,key} para que una frase repetida redispare el efecto */}
      <AdamThought thought={adamThought} />

      {/* Cinemática del árbol prohibido */}
      <ForbiddenTreeCinematic
        show={showForbiddenTree}
        onEnd={() => {
          setShowForbiddenTree(false);
          gameEngineRef.current?.endForbiddenCinematic();
          gameEngineRef.current?.resume();
        }}
      />

      {/* Viñeta sutil durante el gameplay */}
      {gameState === 'playing' && (
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{ background: 'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }}
        />
      )}

      {gameState === 'cinematic' && (
        <CinematicOverlay progress={cinematicProgress} />
      )}

      {gameState === 'start' && !showIntro && (
        <StartScreen onStart={handleStart} />
      )}

      {(gameState === 'playing' || gameState === 'cinematic') && (
        <HUD
          score={score}
          food={foodCount}
          onPause={handlePause}
          onSprint={(active) => gameEngineRef.current?.setTouchSprint(active)}
          onJump={() => gameEngineRef.current?.triggerTouchJump()}
          onInspect={() => gameEngineRef.current?.triggerInspect()}
          showControls={gameState === 'playing'}
        />
      )}

      {gameState === 'paused' && (
        <PauseMenu onResume={handleResume} onExit={() => {
          gameEngineRef.current?.saveRegistry();
          gameEngineRef.current?.restart();
          setScore(0);
          setFoodCount(0);
          setCinematicProgress(0);
          setAdminBootToGameplay(false);
          setShowForbiddenTree(false);
          setShowAwakening(false);
          setAdamThought(null);
          setShowIntro(true);
          setGameState('start');
        }} />
      )}
    </div>
  );
}
