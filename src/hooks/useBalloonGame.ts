import { useRef, useState, useCallback } from 'react';
import { BALLOON_COLORS, BALLOON_GAME_TARGET } from '../utils/constants';
import { isMobile } from '../utils/device';

interface Balloon {
  id: number;
  x: number;
  color: string;
  duration: number;
  delay: number;
  popped: boolean;
  size: number;
}

function createBalloon(id: number): Balloon {
  return {
    id,
    x: Math.random() * 80 + 10,
    color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
    duration: 7 + Math.random() * 5,
    delay: Math.random() * 3,
    popped: false,
    size: isMobile() ? 40 + Math.random() * 20 : 50 + Math.random() * 25,
  };
}

export function useBalloonGame(onComplete: () => void) {
  const [balloons, setBalloons] = useState<Balloon[]>(() =>
    Array.from({ length: BALLOON_GAME_TARGET }, (_, i) => createBalloon(i))
  );
  const [score, setScore] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const lockedBalloons = useRef(new Set<number>());
  const completed = useRef(false);

  const popBalloon = useCallback((id: number) => {
    if (lockedBalloons.current.has(id) || completed.current) return false;
    lockedBalloons.current.add(id);

    setBalloons(prev => {
      const balloon = prev.find(b => b.id === id);
      if (!balloon || balloon.popped) return prev;
      return prev.map(b => b.id === id ? { ...b, popped: true } : b);
    });

    setScore(prev => {
      const newScore = prev + 1;
      if (newScore >= BALLOON_GAME_TARGET) {
        completed.current = true;
        setShowWin(true);
        setTimeout(onComplete, 1500);
      }
      return newScore;
    });

    setTimeout(() => {
      setBalloons(prev =>
        prev.map(b => b.id === id ? createBalloon(id) : b)
      );
      lockedBalloons.current.delete(id);
    }, 1000);
    return true;
  }, [onComplete]);

  const reset = useCallback(() => {
    lockedBalloons.current.clear();
    completed.current = false;
    setBalloons(Array.from({ length: BALLOON_GAME_TARGET }, (_, i) => createBalloon(i)));
    setScore(0);
    setShowWin(false);
  }, []);

  return { balloons, score, showWin, popBalloon, reset };
}
