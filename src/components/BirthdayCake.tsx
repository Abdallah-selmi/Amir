import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { PALETTE } from '../utils/constants';
import { playBlow, playMagic, playWin } from '../utils/sounds';

interface SmokePuff {
  id: number;
  x: number;
}

interface ConfettiBurst {
  id: number;
  angle: number;
  distance: number;
  color: string;
}

export default function BirthdayCake() {
  const [candles, setCandles] = useState([true, true]);
  const [showWin, setShowWin] = useState(false);
  const [smoke, setSmoke] = useState<SmokePuff[]>([]);
  const [confetti, setConfetti] = useState<ConfettiBurst[]>([]);
  const blown = useRef(new Set<number>());

  const blowCandle = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if ('touches' in e) e.preventDefault();
    if (blown.current.has(index)) return;
    blown.current.add(index);

    const x = index === 0 ? 86 : 114;
    const smokePuffs: SmokePuff[] = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 18,
    }));

    setSmoke(prev => [...prev, ...smokePuffs]);
    setTimeout(() => {
      setSmoke(prev => prev.filter(item => !smokePuffs.some(puff => puff.id === item.id)));
    }, 1200);

    const sparkle: ConfettiBurst[] = Array.from({ length: 18 }, (_, i) => ({
      id: Date.now() + i + 100,
      angle: (i / 18) * Math.PI * 2,
      distance: 28 + Math.random() * 54,
      color: PALETTE[i % PALETTE.length],
    }));
    setConfetti(prev => [...prev, ...sparkle]);
    setTimeout(() => {
      setConfetti(prev => prev.filter(item => !sparkle.some(piece => piece.id === item.id)));
    }, 1000);

    playBlow();
    playMagic();

    const nextCandles = [...candles];
    nextCandles[index] = false;
    setCandles(nextCandles);

    if (nextCandles.every(candle => !candle)) {
      playWin();
      setTimeout(() => {
        setShowWin(true);
      }, 300);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        position: 'relative',
      }}
    >
      <motion.svg
        viewBox="0 0 200 180"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: 'clamp(140px, 38vw, 260px)',
          height: 'auto',
          filter: 'drop-shadow(0 10px 30px rgba(255,107,214,0.5))',
          overflow: 'visible',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <text x="10" y="55" fontSize="14">✨</text>
        <text x="176" y="70" fontSize="12">✨</text>
        <text x="155" y="32" fontSize="11">⭐</text>
        <text x="22" y="78" fontSize="11">⭐</text>

        <rect x="20" y="120" width="160" height="50" rx="14" fill="#FF6BD6" />
        <rect x="20" y="120" width="160" height="18" rx="7" fill="#FF8ED4" />
        <path d="M20 130 Q30 118 40 128 Q50 114 60 128 Q70 116 80 128 Q90 114 100 128 Q110 116 120 128 Q130 114 140 128 Q150 116 160 128 Q170 118 180 128" stroke="white" strokeWidth="4" fill="none" opacity="0.9" />

        <rect x="35" y="80" width="130" height="46" rx="12" fill="#9B5DE5" />
        <rect x="35" y="80" width="130" height="16" rx="6" fill="#B87EFF" />
        <path d="M35 90 Q45 76 55 88 Q65 74 75 88 Q85 74 95 88 Q105 74 115 88 Q125 74 135 88 Q145 74 155 88 Q163 78 165 88" stroke="white" strokeWidth="3.5" fill="none" opacity="0.85" />

        <rect x="55" y="50" width="90" height="36" rx="12" fill="#FFE347" />
        <rect x="55" y="50" width="90" height="14" rx="6" fill="#FFF09A" />

        <rect
          x="78"
          y="26"
          width="16"
          height="30"
          rx="6"
          fill="#00F5A0"
          style={{ cursor: 'pointer' }}
          onClick={(e) => blowCandle(0, e)}
          onTouchStart={(e) => blowCandle(0, e)}
        />
        <rect
          x="106"
          y="26"
          width="16"
          height="30"
          rx="6"
          fill="#00CFFF"
          style={{ cursor: 'pointer' }}
          onClick={(e) => blowCandle(1, e)}
          onTouchStart={(e) => blowCandle(1, e)}
        />

        {candles[0] && (
          <g style={{ transformOrigin: '86px 22px', animation: 'flicker 0.8s ease-in-out infinite' }}>
            <ellipse cx="86" cy="20" rx="6" ry="9" fill="#FFE347" opacity="0.96" />
            <ellipse cx="86" cy="22" rx="3" ry="5" fill="#FF8C42" opacity="0.82" />
          </g>
        )}
        {candles[1] && (
          <g style={{ transformOrigin: '114px 22px', animation: 'flicker 0.9s ease-in-out infinite 0.3s' }}>
            <ellipse cx="114" cy="20" rx="6" ry="9" fill="#FFE347" opacity="0.96" />
            <ellipse cx="114" cy="22" rx="3" ry="5" fill="#FF6BD6" opacity="0.82" />
          </g>
        )}

        <circle cx="50" cy="100" r="6" fill="#FFE347" />
        <circle cx="70" cy="105" r="5" fill="#00F5A0" />
        <circle cx="90" cy="100" r="6" fill="#FF6BD6" />
        <circle cx="110" cy="105" r="5" fill="#00CFFF" />
        <circle cx="130" cy="100" r="6" fill="#FFE347" />
        <circle cx="150" cy="105" r="5" fill="#9B5DE5" />
      </motion.svg>

      <AnimatePresence>
        {smoke.map(puff => (
          <motion.div
            key={puff.id}
            initial={{ opacity: 0.65, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -42, scale: 2 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${puff.x}px`,
              top: -20,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'rgba(230,230,230,0.58)',
              pointerEvents: 'none',
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {confetti.map(piece => (
          <motion.div
            key={piece.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(piece.angle) * piece.distance,
              y: Math.sin(piece.angle) * piece.distance - 20,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              borderRadius: 2,
              background: piece.color,
              pointerEvents: 'none',
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {showWin && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 8 }}
            animate={{ scale: [1, 1.08, 1], opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              position: 'absolute',
              top: -60,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 'clamp(16px, 5vw, 28px)',
              fontFamily: 'Bubblegum Sans, cursive',
              color: '#FFE347',
              textShadow: '0 3px 12px rgba(155,93,229,0.8)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            Bravo AMIR! 🌟
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
