import { motion } from 'framer-motion';

interface Props {
  x: number;
  y: number;
  onComplete?: () => void;
}

const COLORS = ['#FF6BD6', '#9B5DE5', '#FFE347', '#00F5A0', '#00CFFF', '#FF8C42'];

export default function RainbowBurst({ x, y, onComplete }: Props) {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (i / 20) * Math.PI * 2,
    color: COLORS[i % COLORS.length],
    distance: 40 + Math.random() * 60,
  }));

  return (
    <div style={{ position: 'fixed', left: x, top: y, pointerEvents: 'none', zIndex: 300 }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          onAnimationComplete={p.id === 0 ? onComplete : undefined}
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: p.color,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}
