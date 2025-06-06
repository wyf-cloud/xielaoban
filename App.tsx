
import React, { useState, useEffect, useCallback } from 'react';
import { Mosquito as MosquitoData, GameStatus, DifficultyLevel, Boss as BossData } from './types';
import MosquitoComponent from './components/Mosquito';
import TenderWriter from './components/TenderWriter';
import ProgressBar from './components/ProgressBar';
import TimerDisplay from './components/TimerDisplay';
import GameOverlay from './components/GameOverlay';
import BossComponent from './components/Boss';

const TARGET_PROGRESS_PERCENT = 100;
const WRITER_POSITION = { x: 50, y: 60 }; // Percentage from top-left
const WRITER_HITBOX_RADIUS = 50;
const BITE_EFFECT_DURATION_MS = 2500;

const DIFFICULTY_SETTINGS = {
  [DifficultyLevel.Easy]: {
    initialTime: 180, // 3 minutes
    baseProgress: 2.0,
    biteSlowdown: 0.7,
    mosquitoSpawnInitial: 2200,
    mosquitoSpawnMin: 1000,
    mosquitoSpeed: 1.2,
    bossSpawnChance: 0.08, // Increased from 0.03
    bossScoldFactor: 0.8, 
    bossDuration: 15000, 
    bossScoldStartDelay: 2000,
  },
  [DifficultyLevel.Normal]: {
    initialTime: 120, // 2 minutes
    baseProgress: 1.5,
    biteSlowdown: 0.5,
    mosquitoSpawnInitial: 1500,
    mosquitoSpawnMin: 600,
    mosquitoSpeed: 1.5,
    bossSpawnChance: 0.15, // Increased from 0.05
    bossScoldFactor: 0.6,
    bossDuration: 12000,
    bossScoldStartDelay: 1500,
  },
  [DifficultyLevel.Hard]: {
    initialTime: 90, // 1.5 minutes
    baseProgress: 1.2,
    biteSlowdown: 0.3,
    mosquitoSpawnInitial: 1000,
    mosquitoSpawnMin: 400,
    mosquitoSpeed: 1.8,
    bossSpawnChance: 0.25, // Increased from 0.08
    bossScoldFactor: 0.4, 
    bossDuration: 10000,
    bossScoldStartDelay: 1000,
  },
};

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Idle);
  const [playerName, setPlayerName] = useState<string>('标书员');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.Normal);
  
  const [progress, setProgress] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(DIFFICULTY_SETTINGS[difficulty].initialTime);
  const [mosquitoes, setMosquitoes] = useState<MosquitoData[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isBittenCooldown, setIsBittenCooldown] = useState<number>(0);
  const [mosquitoSpawnInterval, setMosquitoSpawnInterval] = useState(DIFFICULTY_SETTINGS[difficulty].mosquitoSpawnInitial);
  const [boss, setBoss] = useState<BossData | null>(null);

  const settings = DIFFICULTY_SETTINGS[difficulty];

  const resetGameValues = useCallback(() => {
    setProgress(0);
    setTimeLeft(settings.initialTime);
    setMosquitoes([]);
    setScore(0);
    setIsBittenCooldown(0);
    setMosquitoSpawnInterval(settings.mosquitoSpawnInitial);
    setBoss(null);
  }, [settings]);

  // const startGameLogic = useCallback(() => { // This function is not directly called anymore. Setup calls resetGameValues.
  //   resetGameValues();
  //   setGameStatus(GameStatus.Playing);
  // }, [resetGameValues]);

  const handleSubmitSetup = useCallback((name: string, selectedDifficulty: DifficultyLevel) => {
    setPlayerName(name || '标书员'); 
    setDifficulty(selectedDifficulty);
    // Settings will be updated in the next render due to setDifficulty.
    // resetGameValues will be called by the useEffect watching gameStatus and difficulty.
    setGameStatus(GameStatus.Playing); 
  }, []);
  
  useEffect(() => {
    if (gameStatus === GameStatus.Playing) {
      // This effect ensures that when moving to Playing (either initially or after difficulty change),
      // the game state is reset using the potentially new 'settings' derived from 'difficulty'.
      const currentSettings = DIFFICULTY_SETTINGS[difficulty];
      setProgress(0);
      setTimeLeft(currentSettings.initialTime);
      setMosquitoes([]);
      setScore(0);
      setIsBittenCooldown(0);
      setMosquitoSpawnInterval(currentSettings.mosquitoSpawnInitial);
      setBoss(null);
    }
  }, [gameStatus, difficulty]);


  const handleReturnToSetup = useCallback(() => {
    setGameStatus(GameStatus.Setup);
  }, []);

  // Game Timer
  useEffect(() => {
    if (gameStatus !== GameStatus.Playing) return;
    if (timeLeft <= 0) {
      setGameStatus(GameStatus.Lost);
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [gameStatus, timeLeft]);

  // Progress Update
  useEffect(() => {
    if (gameStatus !== GameStatus.Playing) return;
    if (progress >= TARGET_PROGRESS_PERCENT) {
      setGameStatus(GameStatus.Won);
      return;
    }
    const progressIntervalId = setInterval(() => {
      setProgress(prev => {
        let currentRate = settings.baseProgress / 10; 
        if (Date.now() < isBittenCooldown) {
          currentRate *= settings.biteSlowdown;
        }
        if (boss && boss.isVisible && !boss.clickedAway && Date.now() > boss.scoldStartTime && Date.now() < boss.scoldEndTime) {
          currentRate *= settings.bossScoldFactor;
        }
        const newCalculatedProgress = Math.min(TARGET_PROGRESS_PERCENT, prev + currentRate);
        return Math.max(prev, newCalculatedProgress);
      });
    }, 100);
    return () => clearInterval(progressIntervalId);
  }, [gameStatus, progress, isBittenCooldown, boss, settings]);

  // Mosquito Spawning
  useEffect(() => {
    if (gameStatus !== GameStatus.Playing) return;
    const spawnId = setInterval(() => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      let startX, startY;
      const edge = Math.floor(Math.random() * 4);
      switch (edge) {
        case 0: startX = Math.random() * screenWidth; startY = -30; break;
        case 1: startX = screenWidth + 30; startY = Math.random() * screenHeight; break;
        case 2: startX = Math.random() * screenWidth; startY = screenHeight + 30; break;
        default: startX = -30; startY = Math.random() * screenHeight; break;
      }
      setMosquitoes(prev => [...prev, { id: Date.now(), x: startX, y: startY, isSwatted: false, spawnTime: Date.now() }]);
      setMosquitoSpawnInterval(prevInterval => Math.max(settings.mosquitoSpawnMin, prevInterval - 50));
    }, mosquitoSpawnInterval);
    return () => clearInterval(spawnId);
  }, [gameStatus, mosquitoSpawnInterval, settings.mosquitoSpawnMin]);

  // Boss Spawning & Auto-leave
  useEffect(() => {
    if (gameStatus !== GameStatus.Playing) return;
    const bossInterval = setInterval(() => {
      if (!boss && Math.random() < settings.bossSpawnChance) {
        const screenHeight = window.innerHeight;
        const slideDirection = Math.random() < 0.5 ? 'left' : 'right';
        // x position is not strictly needed for BossData if CSS handles all horizontal movement
        // y position is important
        setBoss({
          id: Date.now(),
          x: 0, // Not directly used by BossComponent style if CSS animates left
          y: screenHeight * 0.25, // Appears near top-mid, a bit higher
          isVisible: true,
          isScolding: false, 
          scoldStartTime: Date.now() + settings.bossScoldStartDelay,
          scoldEndTime: Date.now() + settings.bossScoldStartDelay + settings.bossDuration,
          clickedAway: false,
          slideDirection: slideDirection,
        });
      } else if (boss && boss.isVisible && !boss.clickedAway && Date.now() > boss.scoldEndTime) {
        setBoss(b => b ? { ...b, isVisible: false } : null); 
        setTimeout(() => setBoss(null), 1000); 
      }
    }, 3000); // Check more frequently for boss spawn, e.g., every 3 seconds
    return () => clearInterval(bossInterval);
  }, [gameStatus, boss, settings]);


  const handleMosquitoSwat = useCallback((id: number) => {
    setMosquitoes(prev => prev.map(m => (m.id === id ? { ...m, isSwatted: true } : m)));
    setScore(s => s + 1);
    setTimeout(() => setMosquitoes(prev => prev.filter(m => m.id !== id)), 300);
  }, []);

  const handleMosquitoReachTarget = useCallback((id: number) => {
    setMosquitoes(prev => prev.filter(m => m.id !== id));
    setIsBittenCooldown(Date.now() + BITE_EFFECT_DURATION_MS);
  }, []);

  const handleBossClick = useCallback((id: number) => {
    setBoss(b => b && b.id === id ? { ...b, clickedAway: true, isVisible: false, isScolding: false } : b);
    setScore(s => s + 5); 
    setTimeout(() => setBoss(null), 1000); 
  }, []);

  const writerActualPos = {
      x: window.innerWidth * (WRITER_POSITION.x / 100),
      y: window.innerHeight * (WRITER_POSITION.y / 100)
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-200 to-slate-400 select-none">
      {gameStatus === GameStatus.Playing && (
        <>
          <div className="absolute top-4 left-4 right-4 p-4 bg-slate-800/70 backdrop-blur-md rounded-lg shadow-xl z-30">
            <div className="flex justify-between items-center text-lg md:text-xl">
              <TimerDisplay timeLeft={timeLeft} />
              <div className="text-amber-300">分数: {score}</div>
            </div>
            <ProgressBar progress={progress} />
          </div>

          <TenderWriter 
            playerName={playerName}
            position={WRITER_POSITION} 
            isBitten={Date.now() < isBittenCooldown} 
            isTyping={progress < TARGET_PROGRESS_PERCENT}
          />

          {mosquitoes.map(mosquito => (
            <MosquitoComponent
              key={mosquito.id}
              mosquito={mosquito}
              onSwat={handleMosquitoSwat}
              onReachTarget={handleMosquitoReachTarget}
              targetPosition={writerActualPos}
              targetRadius={WRITER_HITBOX_RADIUS}
              speed={settings.mosquitoSpeed}
            />
          ))}
          
          {boss && <BossComponent bossData={boss} onClick={handleBossClick} playerName={playerName} />}
        </>
      )}

      {(gameStatus === GameStatus.Idle || gameStatus === GameStatus.Setup || gameStatus === GameStatus.Won || gameStatus === GameStatus.Lost) && (
        <GameOverlay 
          status={gameStatus} 
          score={score} 
          onSubmitSetup={handleSubmitSetup}
          onReturnToSetup={handleReturnToSetup}
        />
      )}
    </div>
  );
};

export default App;
