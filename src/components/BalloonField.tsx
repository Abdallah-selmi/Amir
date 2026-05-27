import { motion } from 'framer-motion';
import { BALLOON_COLORS } from '../utils/constants';
import { balloonCount } from '../utils/device';

interface BalloonProps {
  color: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

function Balloon({ color, x, size, duration, delay }: BalloonProps) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        bottom: '-10%',
        left: `${x}%`,
        width: size,
        height: size * 1.2,
        willChange: 'transform',
        zIndex: 2,
        pointerEvents: 'none',
      }}
      initial={{ y: 0, x: 0 }}
      animate={{
        y: [0, -window.innerHeight * 1.3],
        x: [0, 20, -20, 10, -10, 0],
        rotate: [0, 5, -5, 3, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
        delay,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
      }}
    >
      <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <ellipse cx="30" cy="30" rx="28" ry="30" fill={color} opacity="0.92" />
        <ellipse cx="22" cy="20" rx="8" ry="7" fill="white" opacity="0.35" />
        <path d="M30 60 L28 70 L32 70 Z" fill={color} opacity="0.7" />
        <path d="M30 70 Q25 75 30 80 Q35 75 30 70" fill={color} opacity="0.5" />
      </svg>
    </motion.div>
  );
}

export default function BalloonField() {
  const count = balloonCount();

  const balloons = Array.from({ length: count }, (_, i) => ({
    id: i,
    color: BALLOON_COLORS[i % BALLOON_COLORS.length],
    x: 5 + (90 / (count - 1)) * i + (Math.random() - 0.5) * 8,
    size: 32 + Math.random() * 28,
    duration: 6 + Math.random() * 6,
    delay: (i / count) * 4,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {balloons.map(b => (
        <Balloon key={b.id} {...b} />
      ))}
    </div>
  );
}
