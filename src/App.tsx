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
  const showForbiddenTreeRef = useRef(false);
  const exploreHintStartedRef = useRef(false);
  const exploreHintTimerRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>('start');
  const [showIntro, setShowIntro] = useState(true);
  const [adminBootToGameplay, setAdminBootToGameplay] = useState(false);
  const [showExploreHint, setShowExploreHint] = useState(false);
  const [score, setScore] = useState(0);
  const [foodCount, setFoodCount] = useState(0);
  const [cinematicProgress, setCinematicProgress] = useState(0);
  const [showAwakening, setShowAwakening] = useState(false);
  const [showForbiddenTree, setShowForbiddenTree] = useState(false);
  const [adamThought, setAdamThought] = useState<{ text: string; key: number } | null>(null);

  // Estados para el HUD
  const [prompt, setPrompt] = useState<string | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: -20 });

  useEffect(() => {
    gameStateRef.current = gameState;
    showIntroRef.current = showIntro;
    showForbiddenTreeRef.current = showForbiddenTree;
  }, [gameState, showIntro, showForbiddenTree]);

  useEffect(() => {
    if (gameState === 'start') {
      if (exploreHintTimerRef.current !== null) {
        window.clearTimeout(exploreHintTimerRef.current);
        exploreHintTimerRef.current = null;
      }
      exploreHintStartedRef.current = false;
      setShowExploreHint(false);
      return;
    }

    if (gameState === 'playing' && !exploreHintStartedRef.current) {
      exploreHintStartedRef.current = true;
      setShowExploreHint(true);
      exploreHintTimerRef.current = window.setTimeout(() => {
        setShowExploreHint(false);
        exploreHintTimerRef.current = null;
      }, 7000);
    }
  }, [gameState]);

  useEffect(() => () => {
    if (exploreHintTimerRef.current !== null) {
      window.clearTimeout(exploreHintTimerRef.current);
    }
  }, []);

  // Crear el motor al montar
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onStateChange: setGameState,
      onScoreUpdate: setScore,
      onFoodUpdate: setFoodCount,
      onCinematicUpdate: setCinematicProgress,
      onForbiddenTree: () => {
        showForbiddenTreeRef.current = true;
        setShowForbiddenTree(true);
      },
      onAdamThought: (text: string) => setAdamThought({ text, key: Date.now() }),
      onPromptUpdate: setPrompt,
      onCompassUpdate: (yaw, x, z) => {
        setCompassHeading(yaw);
        setPlayerPos({ x, z });
      },
    });

    gameEngineRef.current = engine;
    engine.init();

    return () => {
      engine.dispose();
    };
  }, []);

  // Cuando termina la intro, arranca la escena de la pantalla de título
  useEffect(() => {
    if (!showIntro && !adminBootToGameplay && gameState === 'start') {
      gameEngineRef.current?.showTitleScreen();
    }
  }, [showIntro, adminBootToGameplay, gameState]);

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

      // Tecla Master Admin P:
      // 1. Durante la intro: 1 pulsación salta SOLO la intro y muestra la pantalla de título
      // 2. Si ya está en la pantalla de título o cinemática: salta directo al gameplay
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();

        // Si está en la cinemática del Árbol: cerrarla y volver al gameplay
        if (showForbiddenTreeRef.current) {
          showForbiddenTreeRef.current = false;
          setShowForbiddenTree(false);
          setShowAwakening(false);
          gameEngineRef.current?.endForbiddenCinematic();
          gameEngineRef.current?.resume();
          return;
        }

        // Si está en pausa: reanudar gameplay
        if (currentState === 'paused') {
          setGameState('playing');
          gameEngineRef.current?.resume();
          return;
        }

        // Durante la intro de PSYCODELICINSANE: 1 toque salta SOLO la intro y va al título
        if (introVisible) {
          setShowIntro(false);
          setGameState('start');
          gameEngineRef.current?.showTitleScreen();
          return;
        }

        // Desde la pantalla de título o cinemática del Génesis: lleva directo al gameplay
        if (currentState === 'start' || currentState === 'cinematic') {
          setAdminBootToGameplay(true);
          setShowIntro(false);
          setShowAwakening(false);
          setGameState('playing');
          setCinematicProgress(1);
          gameEngineRef.current?.skipCinematic();
          return;
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
      {/* Canvas 3D */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none z-0"
        style={{ touchAction: 'none', opacity: 1, transition: 'opacity 1.8s ease-out' }}
      />

      {/* Intro PSYCODELICINSANE */}
      {showIntro && (
        <IntroSplash onEnd={handleIntroEnd} />
      )}

      <AwakeningTitle show={showAwakening} />

      {/* Reflexión de Adán */}
      <AdamThought thought={adamThought} />

      {/* Cinemática del árbol prohibido */}
      <ForbiddenTreeCinematic
        show={showForbiddenTree}
        onEnd={() => {
          showForbiddenTreeRef.current = false;
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
          prompt={prompt}
          compassHeading={compassHeading}
          playerPos={playerPos}
          onPause={handlePause}
          onSprint={(active) => gameEngineRef.current?.setTouchSprint(active)}
          onJump={() => gameEngineRef.current?.triggerTouchJump()}
          onInspect={() => gameEngineRef.current?.triggerInspect()}
          showControls={gameState === 'playing'}
          showExploreHint={showExploreHint}
        />
      )}

      {gameState === 'paused' && (
        <PauseMenu
          onResume={handleResume}
          onExit={() => {
            gameEngineRef.current?.saveRegistry();
            gameEngineRef.current?.restart();
            setScore(0);
            setFoodCount(0);
            setCinematicProgress(0);
            setAdminBootToGameplay(false);
            showForbiddenTreeRef.current = false;
            setShowForbiddenTree(false);
            setShowAwakening(false);
            setAdamThought(null);
            setShowIntro(false);
            setGameState('start');
          }}
        />
      )}
    </div>
  );
}
