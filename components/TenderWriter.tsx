
import React from 'react';

interface TenderWriterProps {
  playerName: string;
  position: { x: number; y: number }; // Percentage based
  isBitten: boolean;
  isTyping: boolean;
}

const TenderWriter: React.FC<TenderWriterProps> = ({ playerName, position, isBitten, isTyping }) => {
  const writerBaseClasses = "absolute transform -translate-x-1/2 -translate-y-1/2 p-2 transition-all duration-200";
  const writerAnimationClasses = `
    ${isTyping ? 'animate-typing-bob' : ''}
    ${isBitten ? 'animate-shake' : ''}
  `;

  return (
    <div 
      className={`${writerBaseClasses} ${writerAnimationClasses}`}
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        zIndex: 20 
      }}
    >
      <div className="bg-slate-200/70 p-3 rounded-lg shadow-lg w-28 h-36 md:w-32 md:h-40 relative backdrop-blur-sm">
        {/* Head */}
        <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-pink-300 rounded-full border-2 border-slate-700`}></div>
        {/* Body */}
        <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-16 h-20 md:w-20 md:h-24 bg-blue-500 rounded-md border-2 border-slate-700`}></div>
        {/* Desk */}
        <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-36 h-10 md:w-40 bg-yellow-700 rounded-t-md border-2 border-slate-800 shadow-md"></div>
        {/* Computer Screen */}
        <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-20 h-16 md:w-24 md:h-20 bg-slate-800 rounded-sm border-2 border-slate-500 flex items-center justify-center p-1">
            <div className={`w-full h-full bg-sky-200 ${isTyping ? 'animate-screen-pulse' : ''} text-xs text-slate-900 p-1 overflow-hidden flex items-center justify-center font-semibold`}>
                {isTyping ? `${playerName} 撰写中...` : '已完成!'}
            </div>
        </div>
        {isBitten && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-ping_slow_once">
            哎哟!
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderWriter;
