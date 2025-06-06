
import React from 'react';

interface TimerDisplayProps {
  timeLeft: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={`font-mono text-lg ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-green-300'}`}>
      剩余时间: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

export default TimerDisplay;