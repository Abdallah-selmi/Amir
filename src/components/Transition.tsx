import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PALETTE } from '../utils/constants';

interface Props {
  onComplete: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotate: number;
}

export default function Transition({ onComplete }: Props) {
  const [phase, setPhase] = useState<'explode' | 'wipe' | 'flash'>('explode');

  const confetti = useMemo<ConfettiPiece[]>(() =>
    Array.from({ length: 150 }, (_, i) => {
      const angle = (i / 150) * Math.PI * 2;
      const distance = 80 + Math.random() * 300;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: PALETTE[i % PALETTE.length],
        size: Math.random() * 12 + 6,
        rotate: Math.random() * 720,
      };
    }), []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('wipe'), 500);
    const t2 = setTimeout(() => setPhase('flash'), 2100);
    const t3 = setTimeout(onComplete, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#1a0035',
      }}
    >
      <motion.div
        initial={{ clipPath: 'circle(0% at 50% 50%)' }}
        animate={phase !== 'explode' ? { clipPath: 'circle(200% at 50% 50%)' } : undefined}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #FF6BD6 0%, #9B5DE5 20%, #FFE347 40%, #00F5A0 60%, #00CFFF 80%, #FF6BD6 100%)',
          willChange: 'clip-path',
        }}
      />

      <AnimatePresence>
        {phase === 'wipe' && Array.from({ length: 28 }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 0.8, delay: i * 0.035, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: 20 + Math.random() * 16,
              zIndex: 5,
              pointerEvents: 'none',
              willChange: 'transform, opacity',
            }}
          >
            ✦
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'explode' && confetti.map(piece => (
          <motion.div
            key={piece.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{
              x: piece.x,
              y: piece.y,
              opacity: [1, 1, 0],
              scale: [1, 1.2, 0],
              rotate: piece.rotate,
            }}
            transition={{ duration: 0.72, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: piece.size,
              height: piece.size,
              borderRadius: piece.id % 2 === 0 ? '50%' : 2,
              background: piece.color,
              zIndex: 10,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'white',
              zIndex: 20,
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
