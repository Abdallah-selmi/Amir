import { motion, AnimatePresence } from 'framer-motion';
import { PALETTE } from '../utils/constants';

interface EscapeState {
  x: number;
  y: number;
  escapeCount: number;
  isClickable: boolean;
  message: string | null;
}

interface Props {
  onActivate: () => void;
  escapeState: EscapeState;
}

export default function EscapeButton({ onActivate, escapeState }: Props) {
  const { x, y, isClickable, message, escapeCount } = escapeState;

  const confettiBurst = isClickable
    ? Array.from({ length: 24 }, (_, i) => ({
        id: i,
        angle: (i / 24) * Math.PI * 2,
        color: PALETTE[i % PALETTE.length],
        distance: 44 + Math.random() * 64,
      }))
    : [];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <AnimatePresence>
        {isClickable && confettiBurst.map(piece => (
          <motion.div
            key={piece.id}
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(piece.angle) * piece.distance,
              y: Math.sin(piece.angle) * piece.distance,
              opacity: [1, 1, 0],
              scale: [1, 1.5, 0],
            }}
            transition={{ duration: 1.2, ease: 'easeOut', repeat: Infinity, repeatDelay: 2 }}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: 8,
              height: 8,
              borderRadius: piece.id % 2 === 0 ? '50%' : 2,
              background: piece.color,
              pointerEvents: 'none',
              transformOrigin: 'center',
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -10 }}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `calc(${y}% - 58px)`,
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: 100,
              padding: '8px 20px',
              fontSize: 'clamp(12px, 3.5vw, 16px)',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              color: '#9B5DE5',
              boxShadow: '0 4px 20px rgba(155,93,229,0.35)',
              whiteSpace: 'nowrap',
              zIndex: 20,
              pointerEvents: 'none',
            }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={isClickable ? onActivate : undefined}
        animate={
          isClickable
            ? {
                scale: [1, 1.08, 1],
                boxShadow: [
                  '0 8px 32px rgba(255,107,214,0.5)',
                  '0 0 50px rgba(255,107,214,1)',
                  '0 8px 32px rgba(255,107,214,0.5)',
                ],
              }
            : {
                y: [-8, 0, -8],
              }
        }
        transition={
          isClickable
            ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, #FF6BD6 0%, #9B5DE5 100%)',
          borderRadius: 100,
          padding: 'clamp(14px, 4vw, 20px) clamp(24px, 7vw, 64px)',
          fontSize: 'clamp(16px, 4.5vw, 24px)',
          fontFamily: 'Bubblegum Sans, cursive',
          color: 'white',
          border: 'none',
          cursor: isClickable ? 'pointer' : 'default',
          boxShadow: '0 8px 32px rgba(255,107,214,0.6)',
          whiteSpace: 'nowrap',
          zIndex: 10,
          minWidth: 44,
          minHeight: 44,
          maxWidth: 'calc(100vw - 24px)',
          pointerEvents: 'auto',
          WebkitTapHighlightColor: 'transparent',
          outline: 'none',
          willChange: 'transform',
          textShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}
        aria-label={isClickable ? 'Hourra AMIR!' : 'Ouvrir la Surprise'}
      >
        {isClickable || escapeCount >= 3
          ? 'Hourra AMIR! 🎉'
          : 'Ouvrir la Surprise 🎁'}
      </motion.button>
    </div>
  );
}
