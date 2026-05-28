import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '../audio/audioManager';

export default function MusicToggle() {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const syncState = () => setPlaying(audioManager.isPlaying());
    window.addEventListener('audio-state-change', syncState);
    return () => window.removeEventListener('audio-state-change', syncState);
  }, []);

  const handleToggle = () => {
    // Si premier clic et audio pas encore demarre
    if (audioManager.getState() === 'idle') {
      audioManager.unlock();
      setPlaying(true);
      return;
    }
    const nowPlaying = audioManager.toggle();
    setPlaying(nowPlaying);
  };

  return (
    <motion.button
      onClick={handleToggle}
      onTouchStart={(e) => {
        e.preventDefault();
        handleToggle();
      }}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      style={{
        position: 'fixed',
        top: 'calc(14px + env(safe-area-inset-top))',
        right: 'calc(14px + env(safe-area-inset-right))',
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        zIndex: 500,
        minWidth: '44px',
        minHeight: '44px',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.25)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '2px solid rgba(255,157,226,0.5)',
        boxShadow: '0 4px 16px rgba(199,125,255,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        outline: 'none',
        willChange: 'transform',
      }}
      aria-label={playing ? 'Couper la musique' : 'Jouer la musique'}
    >
      {playing ? (
        <Volume2 size={24} color="#ffffff" strokeWidth={2.5} />
      ) : (
        <VolumeX size={24} color="#ffffff" strokeWidth={2.5} />
      )}
    </motion.button>
  );
}
