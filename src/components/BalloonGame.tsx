import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBalloonGame } from '../hooks/useBalloonGame';
import { BALLOON_GAME_TARGET, PALETTE } from '../utils/constants';
import { playPop, playWin } from '../utils/sounds';

interface Props {
  onComplete: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rotate: number;
  size: number;
  color: string;
}

function createConfettiBurst(x: number, y: number, count: number, spread = 140): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.35;
    const distance = spread * (0.35 + Math.random() * 0.75);
    return {
      id: Date.now() + i + Math.random(),
      x,
      y,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - Math.random() * 40,
      rotate: Math.random() * 720,
      size: 7 + Math.random() * 9,
      color: PALETTE[i % PALETTE.length],
    };
  });
}

function BalloonShape({ color, size }: { color: string; size: number }) {
  return (
    <div
      style={{
        position: 'relative',
        width: `clamp(40px, ${size}px, 70px)`,
        height: `clamp(52px, ${size * 1.22}px, 86px)`,
        minWidth: 44,
        minHeight: 52,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '78%',
          borderRadius: '50% 50% 48% 48%',
          background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.72) 0 12%, transparent 13%), ${color}`,
          boxShadow: 'inset -8px -10px 0 rgba(0,0,0,0.08), 0 10px 22px rgba(26,0,53,0.2)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '10%',
          width: 0,
          height: 0,
          transform: 'translateX(-50%)',
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: `12px solid ${color}`,
          filter: 'brightness(0.92)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          width: 2,
          height: '20%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.75)',
          borderRadius: 8,
        }}
      />
    </div>
  );
}

export default function BalloonGame({ onComplete }: Props) {
  const { balloons, score, showWin, popBalloon } = useBalloonGame(onComplete);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const travelDistance = typeof window === 'undefined' ? 900 : window.innerHeight * 1.35;

  useEffect(() => {
    if (!showWin) return;
    playWin();
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    const pieces = createConfettiBurst(x, y, 100, Math.min(window.innerWidth, 520) * 0.45);
    setConfetti(prev => [...prev, ...pieces]);
    const t = setTimeout(() => {
      setConfetti(prev => prev.filter(piece => !pieces.some(p => p.id === piece.id)));
    }, 1100);
    return () => clearTimeout(t);
  }, [showWin]);

  const handlePop = (id: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if ('touches' in e) e.preventDefault();

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const touch = 'touches' in e ? e.touches[0] : null;
    const clientX = touch?.clientX ?? ('clientX' in e ? e.clientX : rect.left + rect.width / 2);
    const clientY = touch?.clientY ?? ('clientY' in e ? e.clientY : rect.top + rect.height / 2);

    if (!popBalloon(id)) return;

    const pieces = createConfettiBurst(clientX, clientY, 12, 96);
    setConfetti(prev => [...prev, ...pieces]);
    setTimeout(() => {
      setConfetti(prev => prev.filter(piece => !pieces.some(p => p.id === piece.id)));
    }, 900);
    playPop();
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div
        style={{
          position: 'fixed',
          top: 'calc(14px + env(safe-area-inset-top))',
          left: 'calc(14px + env(safe-area-inset-left))',
          background: 'rgba(255,255,255,0.24)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: 100,
          padding: '8px 16px',
          fontSize: 'clamp(14px, 4vw, 22px)',
          fontFamily: 'Bubblegum Sans, cursive',
          color: '#FFE347',
          textShadow: '0 2px 8px rgba(155,93,229,0.72)',
          zIndex: 100,
          pointerEvents: 'none',
          border: '2px solid rgba(255,255,255,0.45)',
          boxShadow: '0 8px 22px rgba(26,0,53,0.18)',
          whiteSpace: 'nowrap',
        }}
      >
        ⭐ Amir: {score} / {BALLOON_GAME_TARGET} ballons!
      </div>

      {score === 0 && !showWin && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{ y: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } }}
          style={{
            position: 'absolute',
            bottom: 'clamp(78px, 17vh, 138px)',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 'clamp(15px, 4vw, 22px)',
            fontFamily: 'Bubblegum Sans, cursive',
            color: '#ffffff',
            textShadow: '0 3px 10px rgba(26,0,53,0.55)',
            pointerEvents: 'none',
            zIndex: 50,
          }}
        >
          Tape les ballons! 🎈
        </motion.div>
      )}

      {balloons.map(balloon => (
        <motion.button
          key={balloon.id}
          type="button"
          initial={{ y: 0, x: '-50%', opacity: 1, scale: 1 }}
          animate={balloon.popped ? { scale: 0, opacity: 0 } : {
            y: -travelDistance,
            x: ['-50%', 'calc(-50% + 20px)', 'calc(-50% - 18px)', 'calc(-50% + 10px)', '-50%'],
          }}
          transition={balloon.popped ? { duration: 0.2 } : {
            duration: balloon.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: balloon.delay,
          }}
          onClick={(e) => handlePop(balloon.id, e)}
          onTouchStart={(e) => handlePop(balloon.id, e)}
          style={{
            position: 'absolute',
            left: `${balloon.x}%`,
            bottom: '-12%',
            border: 'none',
            background: 'transparent',
            padding: 0,
            cursor: 'pointer',
            pointerEvents: balloon.popped || showWin ? 'none' : 'auto',
            willChange: 'transform, opacity',
            zIndex: 10,
            minWidth: 44,
            minHeight: 44,
            touchAction: 'manipulation',
          }}
          aria-label="Ballon magique"
        >
          <BalloonShape color={balloon.color} size={balloon.size} />
        </motion.button>
      ))}

      <AnimatePresence>
        {confetti.map(piece => (
          <motion.div
            key={piece.id}
            initial={{ x: piece.x, y: piece.y, scale: 1, opacity: 1, rotate: 0 }}
            animate={{
              x: piece.x + piece.dx,
              y: piece.y + piece.dy,
              scale: 0,
              opacity: 0,
              rotate: piece.rotate,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              width: piece.size,
              height: piece.size,
              borderRadius: piece.id.toString().endsWith('0') ? '50%' : 3,
              background: piece.color,
              pointerEvents: 'none',
              zIndex: 200,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {showWin && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 24 }}
            animate={{ scale: [1, 1.08, 1], opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '46%',
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: 'clamp(30px, 10vw, 54px)',
              fontFamily: 'Bubblegum Sans, cursive',
              color: '#FFE347',
              textShadow: '0 5px 18px rgba(155,93,229,0.9)',
              pointerEvents: 'none',
              zIndex: 300,
            }}
          >
            Bravo Amir! 🌟
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
