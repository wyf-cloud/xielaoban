
import React, { useState }  from 'react';
import { GameStatus, DifficultyLevel } from '../types';

interface GameOverlayProps {
  status: GameStatus;
  score: number;
  onSubmitSetup: (name: string, difficulty: DifficultyLevel) => void;
  onReturnToSetup: () => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({ status, score, onSubmitSetup, onReturnToSetup }) => {
  const [localName, setLocalName] = useState<string>('');
  const [localDifficulty, setLocalDifficulty] = useState<DifficultyLevel>(DifficultyLevel.Normal);

  let title = '';
  let content;

  const difficultyOptions = [
    { label: '简单', value: DifficultyLevel.Easy },
    { label: '一般', value: DifficultyLevel.Normal },
    { label: '困难', value: DifficultyLevel.Hard },
  ];

  if (status === GameStatus.Idle) {
    title = '标书拯救者';
    content = (
      <>
        <p className="text-lg md:text-xl mb-8 text-slate-200 max-w-md">
          帮助标书员在老板发现前完成标书！点击蚊子消灭它们，小心突然出现的老板！
        </p>
        <button
          onClick={onReturnToSetup}
          className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-xl text-xl transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300"
        >
          开始游戏
        </button>
      </>
    );
  } else if (status === GameStatus.Setup) {
    title = '游戏设置';
    content = (
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <label htmlFor="playerName" className="block text-slate-200 text-lg mb-2">你的名字:</label>
          <input
            type="text"
            id="playerName"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="标书小能手"
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
        </div>
        <div className="mb-8">
          <p className="block text-slate-200 text-lg mb-3">选择难度:</p>
          <div className="flex justify-center space-x-3">
            {difficultyOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setLocalDifficulty(opt.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all
                  ${localDifficulty === opt.value 
                    ? 'bg-sky-500 text-white ring-2 ring-sky-300 shadow-lg' 
                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => onSubmitSetup(localName, localDifficulty)}
          className="w-full px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-xl text-xl transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        >
          开始挑战!
        </button>
      </div>
    );
  } else if (status === GameStatus.Won) {
    title = '恭喜!';
    content = (
      <>
        <p className="text-lg md:text-xl mb-8 text-slate-200 max-w-md">
          在规定时间内完成标书！你太棒了！最终得分: {score}
        </p>
        <button
          onClick={onReturnToSetup}
          className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-xl text-xl transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300"
        >
          再玩一次
        </button>
      </>
    );
  } else if (status === GameStatus.Lost) {
    title = '任务失败!';
    content = (
      <>
        <p className="text-lg md:text-xl mb-8 text-slate-200 max-w-md">
          你完蛋了，未在规定时间内完成标书，标书递交失败，老板正在赶往你的办公室！最终得分: {score}
        </p>
        <button
          onClick={onReturnToSetup}
          className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-xl text-xl transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300"
        >
          再玩一次
        </button>
      </>
    );
  }

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center z-50 p-6 md:p-8 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-sky-400 drop-shadow-lg">{title}</h1>
      {content}
    </div>
  );
};

export default GameOverlay;
