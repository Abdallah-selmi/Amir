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
  const [showAudioPrompt, setShowAudioPrompt] = useState(!audioManager.getIsUnlocked());

  useEffect(() => {
    const events = ['pointerdown', 'touchstart', 'click', 'keydown'] as const;
    const addOptions: AddEventListenerOptions = { capture: true, passive: true };
    const removeOptions: EventListenerOptions = { capture: true };

    const removeGestureListeners = () => {
      events.forEach(eventName => window.removeEventListener(eventName, unlock, removeOptions));
    };

    const syncAudioPrompt = () => {
      const needsGesture = !audioManager.getIsUnlocked();
      setShowAudioPrompt(needsGesture);
      if (!needsGesture) removeGestureListeners();
    };

    const onBlocked = () => setShowAudioPrompt(true);

    function unlock() {
      if (!audioManager.getIsUnlocked()) {
        void audioManager.unlock();
      }
    }

    events.forEach(eventName =>
      window.addEventListener(eventName, unlock, addOptions)
    );
    window.addEventListener('audio-state-change', syncAudioPrompt);
    window.addEventListener('audio-blocked', onBlocked);
    syncAudioPrompt();

    return () => {
      removeGestureListeners();
      window.removeEventListener('audio-state-change', syncAudioPrompt);
      window.removeEventListener('audio-blocked', onBlocked);
      audioManager.destroy();
    };
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

  const startAudio = useCallback(async () => {
    await audioManager.unlock();
    setShowAudioPrompt(!audioManager.getIsUnlocked());
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

      {/* Audio start button */}
      <AnimatePresence>
        {showAudioPrompt && (
          <button
            key="start-audio"
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
            onPointerDown={() => {
              void startAudio();
            }}
            onClick={() => {
              void startAudio();
            }}
          >
            Activer la musique
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
