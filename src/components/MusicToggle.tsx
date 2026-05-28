import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '../audio/audioManager';

export default function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(audioManager.getIsPlaying());

  useEffect(() => {
    const syncState = () => setIsPlaying(audioManager.getIsPlaying());
    window.addEventListener('audio-state-change', syncState);
    return () => window.removeEventListener('audio-state-change', syncState);
  }, []);

  const handleToggle = async () => {
    await audioManager.toggle();
    setIsPlaying(audioManager.getIsPlaying());
  };

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      style={{
        position: 'fixed',
        top: 'calc(14px + env(safe-area-inset-top))',
        right: 'calc(14px + env(safe-area-inset-right))',
        zIndex: 200,
        width: 48,
        height: 48,
        minWidth: 44,
        minHeight: 44,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.25)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '2px solid rgba(255,157,226,0.5)',
        boxShadow: '0 4px 16px rgba(199,125,255,0.3)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        WebkitTapHighlightColor: 'transparent',
        outline: 'none',
        willChange: 'transform',
      }}
      aria-label={isPlaying ? 'Couper la musique' : 'Jouer la musique'}
    >
      {isPlaying ? (
        <Volume2 size={24} color="#ffffff" strokeWidth={2.5} />
      ) : (
        <VolumeX size={24} color="#ffffff" strokeWidth={2.5} />
      )}
    </motion.button>
  );
}
