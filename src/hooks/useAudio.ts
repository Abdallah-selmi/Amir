import { useEffect, useState, useCallback } from 'react';
import { audioManager } from '../audio/audioManager';

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(audioManager.isPlaying());
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const handleBlocked = () => setShowFallback(true);
    const syncState = () => {
      const nextIsPlaying = audioManager.isPlaying();
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
    if (audioManager.getState() === 'idle') {
      audioManager.unlock();
      setIsPlaying(true);
      return;
    }
    setIsPlaying(audioManager.toggle());
  }, []);

  const forcePlay = useCallback(() => {
    audioManager.unlock();
    setIsPlaying(true);
    setShowFallback(false);
  }, []);

  return { isPlaying, showFallback, toggle, forcePlay };
}
