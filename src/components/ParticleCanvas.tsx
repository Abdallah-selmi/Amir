import { useRef } from 'react';
import { useParticles } from '../hooks/useParticles';

interface Props {
  style?: React.CSSProperties;
}

export default function ParticleCanvas({ style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticles(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        ...style,
      }}
    />
  );
}
