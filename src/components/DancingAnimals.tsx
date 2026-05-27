import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { ANIMALS, ANIMAL_NAMES, PALETTE } from '../utils/constants';
import { playAnimalSound } from '../utils/sounds';

interface AnimalBurst {
  id: number;
  x: number;
  y: number;
  symbols: string[];
}

const dances = [
  { rotate: [-15, 15, -15] },
  { x: [-12, 12, -12] },
  { y: [0, -22, 0] },
  { rotate: [-10, 10, -10], x: [-5, 5, -5] },
  { scale: [1, 1.18, 1] },
  { rotate: [0, 360] },
  { y: [0, -10, 0], rotate: [-3, 3, -3] },
  { y: [0, -18, 0], scaleY: [1, 0.9, 1.1, 1] },
];

const durations = [0.5, 1.2, 0.55, 0.7, 0.9, 2.5, 1, 0.8];

export default function DancingAnimals() {
  const [excited, setExcited] = useState<number | null>(null);
  const [bursts, setBursts] = useState<AnimalBurst[]>([]);
  const lastTap = useRef(0);

  const handleTap = (i: number, target: HTMLElement) => {
    const now = Date.now();
    if (now - lastTap.current < 120) return;
    lastTap.current = now;

    const rect = target.getBoundingClientRect();
    const burst: AnimalBurst = {
      id: now + i,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      symbols: ['★', '♥', '★', '♥', '★', '♥', '★', '♥'],
    };

    setBursts(prev => [...prev, burst]);
    setTimeout(() => {
      setBursts(prev => prev.filter(item => item.id !== burst.id));
    }, 900);

    playAnimalSound(i);
    setExcited(i);
    setTimeout(() => setExcited(null), 1200);
  };

  return (
    <div
      className="hide-scrollbar"
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 'clamp(8px, 2vw, 20px)',
        justifyContent: 'center',
        alignItems: 'flex-end',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        width: '100%',
        maxWidth: 'calc(100vw - 24px)',
        padding: '2px 12px 8px',
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none',
      }}
    >
      {ANIMALS.map((animal, i) => (
        <motion.button
          key={ANIMAL_NAMES[i]}
          type="button"
          animate={excited === i ? {
            scale: [1, 1.5, 0.85, 1.2, 1],
            rotate: [0, 35, -35, 0],
          } : dances[i]}
          transition={excited === i ? {
            duration: 0.5,
            ease: 'easeInOut',
          } : {
            duration: durations[i],
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          onClick={(e) => handleTap(i, e.currentTarget)}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTap(i, e.currentTarget);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: '0 0 auto',
            scrollSnapAlign: 'center',
            cursor: 'pointer',
            minWidth: 56,
            minHeight: 74,
            border: 'none',
            background: 'transparent',
            padding: 0,
            willChange: 'transform',
            touchAction: 'manipulation',
          }}
          aria-label={`${ANIMAL_NAMES[i]} joue son son`}
        >
          <span
            style={{
              width: 'clamp(56px, 15vw, 80px)',
              height: 'clamp(56px, 15vw, 80px)',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${PALETTE[i % PALETTE.length]}cc, ${PALETTE[(i + 2) % PALETTE.length]}cc)`,
              border: '3px solid rgba(255,255,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(155,93,229,0.35), inset 0 3px 0 rgba(255,255,255,0.32)',
            }}
          >
            <span style={{ fontSize: 'clamp(28px, 8vw, 44px)' }}>{animal}</span>
          </span>
          <span
            style={{
              marginTop: 4,
              fontSize: 'clamp(11px, 3vw, 14px)',
              fontFamily: 'Bubblegum Sans, cursive',
              color: 'rgba(255,255,255,0.92)',
              textShadow: '0 1px 4px rgba(0,0,0,0.45)',
            }}
          >
            {ANIMAL_NAMES[i]}
          </span>
        </motion.button>
      ))}

      <AnimatePresence>
        {bursts.map(burst => (
          <div
            key={burst.id}
            style={{ position: 'fixed', left: burst.x, top: burst.y, pointerEvents: 'none', zIndex: 220 }}
          >
            {burst.symbols.map((symbol, j) => {
              const angle = (j / burst.symbols.length) * Math.PI * 2;
              const distance = 42 + Math.random() * 40;
              return (
                <motion.span
                  key={`${burst.id}-${j}`}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance - 48,
                    opacity: 0,
                    scale: 0.5,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    fontSize: 20,
                    color: j % 2 === 0 ? '#FFE347' : '#FF6BD6',
                    willChange: 'transform, opacity',
                  }}
                >
                  {symbol}
                </motion.span>
              );
            })}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
