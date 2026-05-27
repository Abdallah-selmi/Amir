import { useEffect, useState, useCallback } from 'react';
import { audioManager } from '../audio/audioManager';

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(audioManager.getIsPlaying());
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const handleBlocked = () => setShowFallback(true);
    const syncState = () => {
      const nextIsPlaying = audioManager.getIsPlaying();
      setIsPlaying(nextIsPlaying);
      if (nextIsPlaying) setShowFallback(false);
    };

    window.addEventListener('audio-blocked', handleBlocked);
    window.addEventListener('audio-state-change', syncState);

    return () => {
      window.removeEventListener('audio-blocked', handleBlocked);
      window.removeEventListener('audio-state-change', syncState);
    };
  }, []);

  const toggle = useCallback(() => {
    setIsPlaying(audioManager.toggle());
  }, []);

  const forcePlay = useCallback(async () => {
    await audioManager.unlock();
    setIsPlaying(audioManager.getIsPlaying());
    setShowFallback(!audioManager.getIsPlaying());
  }, []);

  return { isPlaying, showFallback, toggle, forcePlay };
}
