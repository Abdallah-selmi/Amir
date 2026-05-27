import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './components/LandingPage';
import CelebrationPage from './components/CelebrationPage';
import Transition from './components/Transition';
import MusicToggle from './components/MusicToggle';
import { audioManager } from './audio/audioManager';

type Page = 'landing' | 'transition' | 'celebration';

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [showAudioFallback, setShowAudioFallback] = useState(false);

  useEffect(() => {
    const events = ['click', 'touchstart', 'touchend', 'keydown'] as const;

    const unlock = () => {
      audioManager.unlock();
      events.forEach(e => window.removeEventListener(e, unlock));
    };

    events.forEach(e =>
      window.addEventListener(e, unlock, { once: true, passive: true })
    );

    return () => {
      events.forEach(e => window.removeEventListener(e, unlock));
      audioManager.destroy();
    };
  }, []);

  useEffect(() => {
    const onBlocked = () => setShowAudioFallback(true);
    window.addEventListener('audio-blocked', onBlocked);
    return () => window.removeEventListener('audio-blocked', onBlocked);
  }, []);

  const handleActivate = useCallback(() => {
    setPage('transition');
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setPage('celebration');
  }, []);

  const handleReset = useCallback(() => {
    setPage('landing');
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <AnimatePresence mode="wait">
        {page === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          >
            <LandingPage onActivate={handleActivate} />
          </motion.div>
        )}

        {page === 'transition' && (
          <motion.div
            key="transition"
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          >
            <Transition onComplete={handleTransitionComplete} />
          </motion.div>
        )}

        {page === 'celebration' && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          >
            <CelebrationPage onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music toggle */}
      <MusicToggle />

      {/* Audio fallback button */}
      <AnimatePresence>
        {showAudioFallback && (
          <button
            key="fallback-audio"
            style={{
              position: 'fixed',
              bottom: 'calc(24px + env(safe-area-inset-bottom))',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #FF6BD6, #9B5DE5)',
              color: '#ffffff',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '100px',
              fontFamily: 'Bubblegum Sans, cursive',
              fontSize: 'clamp(14px, 4vw, 20px)',
              fontWeight: 'bold',
              cursor: 'pointer',
              zIndex: 9999,
              minHeight: '48px',
              minWidth: '48px',
              boxShadow: '0 8px 30px rgba(155,93,229,0.6)',
              WebkitTapHighlightColor: 'transparent',
            }}
            onClick={() => {
              audioManager.unlock();
              setShowAudioFallback(false);
            }}
          >
            🎵 Touche pour la musique !
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
