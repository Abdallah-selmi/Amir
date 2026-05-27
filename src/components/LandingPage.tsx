import { useRef } from 'react';
import { motion } from 'framer-motion';
import BalloonGame from './BalloonGame';
import ParticleCanvas from './ParticleCanvas';
import EscapeButton from './EscapeButton';
import { useEscapeButton } from '../hooks/useEscapeButton';
import { isMobile } from '../utils/device';

interface Props {
  onActivate: () => void;
}

const clouds = [
  { id: 0, top: '6%', left: '5%', width: 132, delay: 0, duration: 18 },
  { id: 1, top: '14%', left: '55%', width: 96, delay: 4, duration: 22 },
  { id: 2, top: '4%', left: '32%', width: 150, delay: 8, duration: 16 },
  { id: 3, top: '20%', right: '4%', width: 108, delay: 2, duration: 20 },
];

const stars = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  top: `${4 + Math.random() * 48}%`,
  left: `${Math.random() * 96}%`,
  size: 8 + Math.random() * 16,
  delay: Math.random() * 3,
  duration: 1.5 + Math.random() * 2,
}));

function Cloud({ top, left, right, width, delay, duration }: {
  top: string;
  left?: string;
  right?: string;
  width: number;
  delay: number;
  duration: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        right,
        width,
        animation: `cloudDrift ${duration}s ease-in-out ${delay}s infinite`,
        zIndex: 1,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    >
      <svg viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%">
        <ellipse cx="60" cy="40" rx="55" ry="22" fill="white" opacity="0.72" />
        <ellipse cx="40" cy="32" rx="28" ry="24" fill="white" opacity="0.66" />
        <ellipse cx="78" cy="30" rx="24" ry="20" fill="white" opacity="0.6" />
      </svg>
    </div>
  );
}

function Grass() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'clamp(50px, 10vh, 90px)',
        animation: 'grassSway 4s ease-in-out infinite',
        transformOrigin: 'bottom center',
        willChange: 'transform',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <svg viewBox="0 0 400 60" preserveAspectRatio="none" width="100%" height="100%">
        <defs>
          <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00F5A0" />
            <stop offset="100%" stopColor="#00C98A" />
          </linearGradient>
        </defs>
        <path d="M0,60 Q50,20 80,45 Q120,10 160,40 Q200,5 240,35 Q280,15 320,45 Q360,10 400,50 L400,60 Z" fill="url(#grassGrad)" />
        <path d="M0,60 Q30,35 60,50 Q100,25 140,48 Q180,30 220,52 Q260,35 300,55 Q340,40 400,60 Z" fill="#00E090" opacity="0.72" />
      </svg>
    </div>
  );
}

function Rainbow() {
  return (
    <motion.div
      animate={{ scale: [1, 1.04, 1], opacity: [0.82, 0.96, 0.82] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        top: '8%',
        right: '-5%',
        width: 'clamp(180px, 45vw, 320px)',
        rotate: '-10deg',
        zIndex: 0,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
    >
      <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%">
        <defs>
          <linearGradient id="landingRainbow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF6BD6" />
            <stop offset="25%" stopColor="#9B5DE5" />
            <stop offset="50%" stopColor="#00CFFF" />
            <stop offset="75%" stopColor="#00F5A0" />
            <stop offset="100%" stopColor="#FFE347" />
          </linearGradient>
        </defs>
        <path d="M10,110 Q100,-30 190,110" stroke="url(#landingRainbow)" strokeWidth="20" fill="none" strokeLinecap="round" opacity="0.78" />
        <path d="M25,110 Q100,0 175,110" stroke="white" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.32" />
      </svg>
    </motion.div>
  );
}

export default function LandingPage({ onActivate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mobile = isMobile();
  const escapeState = useEscapeButton(containerRef);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        minHeight: '-webkit-fill-available',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #FF6BD6 0%, #9B5DE5 35%, #00CFFF 75%, #00F5A0 100%)',
        animation: 'skyHue 8s ease-in-out infinite',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <Rainbow />
      {clouds.map(cloud => <Cloud key={cloud.id} {...cloud} />)}
      {stars.map(star => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            background: 'white',
            borderRadius: '50%',
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            zIndex: 0,
            pointerEvents: 'none',
            willChange: 'transform, opacity',
          }}
        />
      ))}

      <ParticleCanvas />
      <BalloonGame onComplete={onActivate} />
      <Grass />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 'clamp(58px, 10vh, 100px) 12px 0',
          zIndex: 6,
          pointerEvents: 'none',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.86, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: mobile ? 'blur(10px)' : 'blur(16px)',
            WebkitBackdropFilter: mobile ? 'blur(10px)' : 'blur(16px)',
            borderRadius: 32,
            border: '3px solid rgba(255,255,255,0.5)',
            padding: 'clamp(24px, 6vw, 56px) clamp(20px, 8vw, 64px)',
            maxWidth: 'min(580px, 92vw)',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(155,93,229,0.4), inset 0 2px 0 rgba(255,255,255,0.4)',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 'clamp(32px, 10vw, 56px)', marginBottom: 10, willChange: 'transform' }}
          >
            🎪
          </motion.div>

          <div
            style={{
              fontSize: 'clamp(18px, 5.5vw, 36px)',
              fontFamily: 'Bubblegum Sans, cursive',
              background: 'linear-gradient(135deg, #FFE347, #FF6BD6, #00F5A0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 10,
              lineHeight: 1.25,
            }}
          >
            Un petit prince fête ses 2 ans! 🎉
          </div>

          <div
            style={{
              fontSize: 'clamp(13px, 3.5vw, 18px)',
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.9)',
              lineHeight: 1.6,
            }}
          >
            Une aventure magique t'attend...
          </div>
        </motion.div>
      </div>

      <div style={{ position: 'absolute', inset: 0, zIndex: 8, pointerEvents: 'none' }}>
        <EscapeButton onActivate={onActivate} escapeState={escapeState} />
      </div>
    </div>
  );
}
