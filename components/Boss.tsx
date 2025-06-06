import React, { useState, useEffect, useRef } from 'react';
import { Boss as BossData } from '../types';

interface BossProps {
  bossData: BossData;
  onClick: (id: number) => void;
  playerName: string;
}

const SCOLD_MESSAGES: ((playerName: string) => string)[] = [
  (name: string) => `${name}, 搞快点!`,
  (_name: string) => "效率呢?!",
  (_name: string) => "时间不多了!",
  (name: string) => `${name}, 就你这样还想加薪?`,
  (_name: string) => "我可盯着你呢!",
  (_name: string) => "deadline是第一生产力!",
  (name: string) => `${name}! 你怎么写的这么慢!`,
  (name: string) => `你是猪吗, ${name}? 老板我都比你快!`,
  (_name: string) => "快点快点，没时间了!",
  (name: string) => `${name}, 这进度也太慢了吧! 加班!`,
  (_name: string) => "能不能行啊?! 不行换人!",
  (name: string) => `喂, ${name}, 醒醒! 还在摸鱼?`,
  (_name: string) => "抓紧时间! 项目要紧!",
  (name: string) => `${name}, 你这速度，标书黄花菜都凉了!`,
];


const BossComponent: React.FC<BossProps> = ({ bossData, onClick, playerName }) => {
  const [scoldMessage, setScoldMessage] = useState<string>('');
  const [_tick, setTick] = useState(0); 
  const wasPreviouslyScoldingRef = useRef(false);
  const initialEntryStylesAppliedRef = useRef(false);
  const prevBossIdRef = useRef<number | null>(null);


  // Reset initialEntryStylesAppliedRef if boss instance changes
  useEffect(() => {
    if (bossData && prevBossIdRef.current !== bossData.id) {
      initialEntryStylesAppliedRef.current = false;
      prevBossIdRef.current = bossData.id;
    }
  }, [bossData]);

  useEffect(() => {
    if (!bossData.isVisible || bossData.clickedAway) {
      initialEntryStylesAppliedRef.current = false; // Reset if boss is not meant to be actively entering/visible
      return;
    }
    const timerId = setInterval(() => {
      const now = Date.now();
      const currentlyInScoldWindow = now >= bossData.scoldStartTime && now < bossData.scoldEndTime;
      if (currentlyInScoldWindow || (wasPreviouslyScoldingRef.current && !currentlyInScoldWindow) || (!wasPreviouslyScoldingRef.current && currentlyInScoldWindow)) {
        setTick(t => t + 1);
      }
      if (now >= bossData.scoldEndTime) {
        clearInterval(timerId);
      }
    }, 500); 
    return () => clearInterval(timerId);
  }, [bossData.isVisible, bossData.clickedAway, bossData.scoldStartTime, bossData.scoldEndTime]);

  const isScoldingPeriodActive =
    bossData.isVisible &&
    !bossData.clickedAway &&
    Date.now() >= bossData.scoldStartTime &&
    Date.now() < bossData.scoldEndTime;

  useEffect(() => {
    wasPreviouslyScoldingRef.current = isScoldingPeriodActive;
  }, [isScoldingPeriodActive]);

  useEffect(() => {
    let messageChangeIntervalId: number | undefined;
    if (isScoldingPeriodActive) {
      const pickNewMessage = () => {
        const randomScoldFn = SCOLD_MESSAGES[Math.floor(Math.random() * SCOLD_MESSAGES.length)];
        setScoldMessage(randomScoldFn(playerName));
      };
      if (scoldMessage === '' || !wasPreviouslyScoldingRef.current) {
        pickNewMessage();
      }
      messageChangeIntervalId = setInterval(() => {
        if (Date.now() < bossData.scoldEndTime) {
          pickNewMessage();
        } else {
          clearInterval(messageChangeIntervalId);
        }
      }, 4000);
    } else {
      setScoldMessage(''); 
    }
    return () => {
      if (messageChangeIntervalId) {
        clearInterval(messageChangeIntervalId);
      }
    };
  }, [isScoldingPeriodActive, playerName, bossData.id, bossData.scoldEndTime]); // bossData.id to reset if boss changes

  if (!bossData) {
      return null;
  }
  
  let determinedAnimationClass = '';
  const appSaysBossShouldBeVisible = bossData.isVisible && !bossData.clickedAway;

  if (bossData.clickedAway) { 
    determinedAnimationClass = bossData.slideDirection === 'left' ? 'animate-boss-exit-left' : 'animate-boss-exit-right';
    initialEntryStylesAppliedRef.current = false; // Reset if clicked away
  } else if (appSaysBossShouldBeVisible) { 
    determinedAnimationClass = bossData.slideDirection === 'left' ? 'animate-boss-enter-left' : 'animate-boss-enter-right';
  } else { 
    determinedAnimationClass = bossData.slideDirection === 'left' ? 'animate-boss-exit-left' : 'animate-boss-exit-right';
    initialEntryStylesAppliedRef.current = false; // Reset if auto-leaving
  }
  
  const style: React.CSSProperties = {
    top: `${bossData.y}px`,
    zIndex: 35,
    transform: `translate(-50%, -50%) ${isScoldingPeriodActive ? 'rotate(1deg)' : ''}`,
  };

  const isTimeForInitialEnterStyle = appSaysBossShouldBeVisible && 
                                   determinedAnimationClass.includes('enter') && 
                                   !initialEntryStylesAppliedRef.current;

  if (isTimeForInitialEnterStyle) {
    style.opacity = 0; 
    style.left = bossData.slideDirection === 'right' ? `calc(100% + 150px)` : `-150px`;
    initialEntryStylesAppliedRef.current = true; // Mark as applied FOR THIS ENTRY SEQUENCE
  }
  
  return (
    <div
      className={`absolute w-32 h-48 md:w-36 md:h-52 transform cursor-pointer p-2
                  ${isScoldingPeriodActive ? 'animate-boss-scold-shake' : ''}
                  ${determinedAnimationClass} 
                 `}
      style={style}
      onClick={() => onClick(bossData.id)}
      role="button"
      aria-label="老板"
      tabIndex={0}
    >
      <div className="w-full h-full bg-slate-700 rounded-lg border-4 border-slate-800 shadow-2xl relative flex flex-col items-center p-2">
        <div className="w-16 h-16 bg-orange-300 rounded-full border-2 border-slate-900 mt-1"></div>
        <div className="w-4 h-10 bg-red-600 mt-1 rounded-sm transform skew-y-6 border border-black"></div> 
        <div className="w-24 h-20 bg-slate-600 rounded-md mt-[-10px] border-2 border-slate-900"></div>
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 text-sm rounded-full shadow-md">
          老板
        </div>

        {isScoldingPeriodActive && scoldMessage && (
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 min-w-[120px] max-w-[220px] bg-white p-2 rounded-lg shadow-xl border-2 border-gray-400 animate-speech-bubble-appear z-10">
            <p className="text-sm text-gray-800 font-semibold">{scoldMessage}</p>
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BossComponent;