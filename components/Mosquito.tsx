
import React, { useState, useEffect, memo } from 'react';
import { Mosquito as MosquitoData } from '../types';

interface MosquitoProps {
  mosquito: MosquitoData;
  onSwat: (id: number) => void;
  onReachTarget: (id: number) => void;
  targetPosition: { x: number; y: number };
  targetRadius: number;
  speed: number; // Added speed prop
}

// const MOSQUITO_SPEED = 1.5; // Now passed as prop
const MOSQUITO_WIGGLE_FACTOR = 0.5; 

const MosquitoComponent: React.FC<MosquitoProps> = ({ mosquito, onSwat, onReachTarget, targetPosition, targetRadius, speed }) => {
  const [position, setPosition] = useState({ x: mosquito.x, y: mosquito.y });

  useEffect(() => {
    if (mosquito.isSwatted) return; 

    const moveInterval = setInterval(() => {
      setPosition(prevPos => {
        const dx = targetPosition.x - prevPos.x;
        const dy = targetPosition.y - prevPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < targetRadius) {
          onReachTarget(mosquito.id); 
          clearInterval(moveInterval); 
          return prevPos; 
        }
        
        const wiggleX = (Math.random() - 0.5) * MOSQUITO_WIGGLE_FACTOR * speed * 5; // Use prop speed
        const wiggleY = (Math.random() - 0.5) * MOSQUITO_WIGGLE_FACTOR * speed * 5; // Use prop speed

        const moveX = (dx / dist) * speed + wiggleX; // Use prop speed
        const moveY = (dy / dist) * speed + wiggleY; // Use prop speed
        
        const newX = prevPos.x + moveX;
        const newY = prevPos.y + moveY;
        return { x: newX, y: newY };
      });
    }, 30); 

    return () => {
      clearInterval(moveInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mosquito.id, mosquito.isSwatted, onReachTarget, targetPosition.x, targetPosition.y, targetRadius, speed]);


  return (
    <div
      className="absolute w-14 h-14 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer drop-shadow-lg"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`, 
        zIndex: mosquito.isSwatted ? 15 : 25,
      }}
      onClick={() => {
        if (!mosquito.isSwatted) {
            onSwat(mosquito.id);
        }
      }}
      aria-label="蚊子"
      role="button"
      tabIndex={0}
    >
      {!mosquito.isSwatted && (
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          fill="black"
        >
          {/* Body */}
          <ellipse cx="50" cy="50" rx="15" ry="25" fill="#333"/>
          {/* Head */}
          <circle cx="50" cy="25" r="10" fill="#222"/>
          {/* Wings */}
          <ellipse cx="30" cy="45" rx="25" ry="10" transform="rotate(-20 30 45)" fill="rgba(0,0,0,0.3)"/>
          <ellipse cx="70" cy="45" rx="25" ry="10" transform="rotate(20 70 45)" fill="rgba(0,0,0,0.3)"/>
          {/* Legs (simple lines) */}
          <line x1="40" y1="60" x2="20" y2="70" stroke="#111" strokeWidth="3"/>
          <line x1="40" y1="70" x2="20" y2="85" stroke="#111" strokeWidth="3"/>
          <line x1="60" y1="60" x2="80" y2="70" stroke="#111" strokeWidth="3"/>
          <line x1="60" y1="70" x2="80" y2="85" stroke="#111" strokeWidth="3"/>
           {/* Stinger (Proboscis) */}
          <line x1="50" y1="15" x2="50" y2="0" stroke="#111" strokeWidth="3" />
        </svg>
      )}
      {mosquito.isSwatted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(200, 38, 38, 0.95)" className="w-12 h-12">
            <path d="M15.901 8.086a.75.75 0 00-1.06-1.06L12 9.879l-2.84-2.853a.75.75 0 10-1.061 1.06L10.939 12l-2.853 2.84a.75.75 0 001.06 1.061L12 13.061l2.84 2.853a.75.75 0 101.061-1.06L13.061 12l2.84-2.854zM2.193 8.617a10.423 10.423 0 01-.159-1.281A10.453 10.453 0 011.51 4.82a1.51 1.51 0 012.036-1.15c.44.198.832.457 1.185.765C5.594 3.64 6.36 3.056 7.216 2.61c.492-.254 1.01-.437 1.548-.55A10.45 10.45 0 0112.001 2c1.565 0 3.076.344 4.438.97.506.21 1 .485 1.442.818.93.702 1.524 1.468 1.93 2.332.21.457.353.93.434 1.419a10.453 10.453 0 010 3.038 11.75 11.75 0 01-.434 1.42c-.406.863-.999 1.63-1.93 2.331a4.14 4.14 0 01-1.442.818A10.45 10.45 0 0112.001 22a10.45 10.45 0 01-3.237-.56c-.538-.113-1.056-.296-1.548-.55-.855-.446-1.622-1.03-2.483-1.826-.353-.308-.746-.567-1.185-.765a1.51 1.51 0 01-1.15-2.036c.11-.59.154-1.185.159-1.781a10.428 10.428 0 00-.159-1.281l-.001-.001z"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default memo(MosquitoComponent);
