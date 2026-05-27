import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BalloonField from './BalloonField';
import ParticleCanvas from './ParticleCanvas';
import BirthdayCake from './BirthdayCake';
import DancingAnimals from './DancingAnimals';
import { letterVariants } from '../utils/animations';
import { AMIR_LETTERS, LETTER_COLORS, PALETTE } from '../utils/constants';
import { playSparkle } from '../utils/sounds';

const MESSAGES = [
  'Tu es notre petit soleil, Amir 🌞',
  'Que tes rêves soient aussi grands que ton sourire! 💫',
];

interface Props {
  onReset: () => void;
}

function TypewriterText({ text, startDelay = 2000 }: { text: string; startDelay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setStarted(false);
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay, text]);

  useEffect(() => {
    if (!started || displayed.length >= text.length) return;
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, 55);
    return () => clearTimeout(t);
  }, [started, displayed, text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && started && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ borderLeft: '2px solid #FF6BD6', marginLeft: 2 }}
        />
      )}
    </span>
  );
}

function AgeCounter() {
  const [age, setAge] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAge(2), 650);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, type: 'spring' }}
      style={{
        fontSize: 'clamp(20px, 6vw, 36px)',
        fontFamily: 'Bubblegum Sans, cursive',
        color: 'white',
        textShadow: '0 2px 8px rgba(155,93,229,0.6)',
        marginBottom: 'clamp(20px, 5vh, 40px)',
      }}
    >
      {age} ans aujourd'hui! ✨
    </motion.div>
  );
}

function StarButton({ active, onClick }: {
  active: boolean;
  onClick: (target: HTMLElement) => void;
}) {
  const lastTap = useRef(0);

  const tap = (target: HTMLElement) => {
    const now = Date.now();
    if (now - lastTap.current < 120) return;
    lastTap.current = now;
    onClick(target);
  };

  return (
    <motion.button
      type="button"
      onClick={(e) => tap(e.currentTarget)}
      onTouchStart={(e) => {
        e.preventDefault();
        tap(e.currentTarget);
      }}
      whileHover={{ scale: 1.16 }}
      whileTap={{ scale: 0.9 }}
      animate={active ? { y: [0, -10, 0], rotate: [-8, 8, 0] } : undefined}
      transition={{ duration: 0.45 }}
      style={{
        fontSize: 'clamp(28px, 8vw, 48px)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 44,
        minHeight: 44,
        border: 'none',
        background: 'transparent',
        padding: 0,
        willChange: 'transform',
        filter: active
          ? 'drop-shadow(0 0 12px rgba(255,227,71,0.9))'
          : 'drop-shadow(0 2px 6px rgba(255,227,71,0.6))',
        touchAction: 'manipulation',
      }}
      aria-label="Etoile magique"
    >
      ⭐
    </motion.button>
  );
}

export default function CelebrationPage({ onReset }: Props) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [starsLit, setStarsLit] = useState<boolean[]>([false, false, false, false, false]);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);

  const addBurst = (target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setBursts(prev => [...prev, { id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);
    setTimeout(() => {
      setBursts(prev => prev.filter(burst => burst.id !== id));
    }, 900);
  };

  const handleStarClick = (index: number, target: HTMLElement) => {
    setStarsLit(prev => prev.map((value, i) => i === index ? true : value));
    addBurst(target);
    playSparkle();
  };

  useEffect(() => {
    const t = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % MESSAGES.length);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        minHeight: '-webkit-fill-available',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #9B5DE5 0%, #FF6BD6 30%, #FFE347 60%, #00F5A0 100%)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <ParticleCanvas />
      <BalloonField />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 'clamp(42px, 7vh, 72px)',
          paddingBottom: 'clamp(30px, 8vh, 70px)',
          paddingLeft: 12,
          paddingRight: 12,
        }}
      >
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: [0, -8, 0], opacity: 1 }}
          transition={{ y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.4 } }}
          style={{
            fontSize: 'clamp(18px, 6vw, 42px)',
            fontFamily: 'Bubblegum Sans, cursive',
            color: '#FFE347',
            textShadow: '0 3px 0 #9B5DE5, 0 5px 12px rgba(0,0,0,0.22)',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: 'clamp(16px, 4vh, 32px)',
            willChange: 'transform',
          }}
        >
          🎉 JOYEUX ANNIVERSAIRE 🎉
        </motion.div>

        <div
          style={{
            display: 'flex',
            gap: 'clamp(4px, 1.8vw, 16px)',
            marginBottom: 'clamp(12px, 3vh, 24px)',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '100%',
            position: 'relative',
            zIndex: 8,
          }}
        >
          {AMIR_LETTERS.map((letter, i) => (
            <motion.span
              key={`${letter}-${i}`}
              custom={i}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              style={{
                display: 'inline-block',
                lineHeight: 0.92,
                filter: `drop-shadow(0 4px 16px ${LETTER_COLORS[i]}88)`,
                willChange: 'transform',
              }}
            >
              <motion.span
                animate={{
                  filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  filter: { duration: 4 + i, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2 + i * 0.2, repeat: Infinity, ease: 'easeInOut' },
                }}
                style={{
                  display: 'inline-block',
                  fontSize: 'clamp(56px, 18vw, 130px)',
                  fontFamily: 'Bubblegum Sans, cursive',
                  lineHeight: 0.92,
                  background: `linear-gradient(135deg, ${LETTER_COLORS[i]}, ${PALETTE[(i + 3) % PALETTE.length]})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: LETTER_COLORS[i],
                  willChange: 'filter, transform',
                }}
              >
                {letter}
              </motion.span>
            </motion.span>
          ))}
        </div>

        <AgeCounter />

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 250, damping: 18, delay: 0.8 }}
          style={{ marginBottom: 'clamp(20px, 5vh, 36px)', willChange: 'transform' }}
        >
          <BirthdayCake />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          style={{ marginBottom: 'clamp(24px, 6vh, 44px)', maxWidth: '100%' }}
        >
          <DancingAnimals />
        </motion.div>

        <motion.div
          key={messageIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: 'clamp(14px, 4vw, 22px)',
            fontFamily: 'Nunito, sans-serif',
            fontStyle: 'italic',
            fontWeight: 700,
            textAlign: 'center',
            maxWidth: 'min(480px, 90vw)',
            lineHeight: 1.6,
            marginBottom: 'clamp(18px, 5vh, 34px)',
            background: 'linear-gradient(135deg, #ffffff, #FFE347)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 2px 6px rgba(155,93,229,0.55))',
          }}
        >
          <TypewriterText text={MESSAGES[messageIndex]} />
        </motion.div>

        <div
          style={{
            display: 'flex',
            gap: 'clamp(4px, 1.5vw, 14px)',
            marginBottom: 'clamp(20px, 5vh, 36px)',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'nowrap',
          }}
        >
          {[0, 1, 2, 3, 4].map(i => (
            <StarButton
              key={i}
              active={starsLit[i]}
              onClick={(target) => handleStarClick(i, target)}
            />
          ))}
        </div>

        <motion.button
          type="button"
          onClick={onReset}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.7, type: 'spring' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(135deg, #00F5A0 0%, #00CFFF 100%)',
            borderRadius: 100,
            padding: 'clamp(10px, 3vw, 16px) clamp(22px, 6vw, 48px)',
            fontSize: 'clamp(13px, 3.5vw, 20px)',
            fontFamily: 'Bubblegum Sans, cursive',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 6px 28px rgba(0,245,160,0.5)',
            minWidth: 44,
            minHeight: 44,
            WebkitTapHighlightColor: 'transparent',
            outline: 'none',
            willChange: 'transform',
            textShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}
        >
          🔄 Rejouer la magie!
        </motion.button>
      </div>

      <AnimatePresence>
        {bursts.map(burst => (
          <div
            key={burst.id}
            style={{ position: 'fixed', left: burst.x, top: burst.y, pointerEvents: 'none', zIndex: 240 }}
          >
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const distance = 28 + Math.random() * 42;
              return (
                <motion.span
                  key={`${burst.id}-${i}`}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance - 24,
                    opacity: 0,
                    scale: 0.35,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    fontSize: 20,
                    color: PALETTE[i % PALETTE.length],
                    willChange: 'transform, opacity',
                  }}
                >
                  ✨
                </motion.span>
              );
            })}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
