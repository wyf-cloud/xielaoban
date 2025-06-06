
import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const displayProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="mt-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-sky-200">标书进度</span>
        <span className="text-sm font-medium text-sky-200">{Math.round(displayProgress)}%</span>
      </div>
      <div className="w-full bg-slate-600 rounded-full h-4 md:h-5 shadow-inner">
        <div
          className="bg-gradient-to-r from-sky-500 to-cyan-400 h-4 md:h-5 rounded-full transition-all duration-150 ease-linear"
          style={{ width: `${displayProgress}%` }}
          aria-valuenow={displayProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
          aria-label="标书进度"
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;