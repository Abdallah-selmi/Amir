import { useRef, useEffect } from 'react';
import { PALETTE } from '../utils/constants';
import { isMobile, prefersReducedMotion, particleCount } from '../utils/device';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  alpha: number;
  color: string;
  type: 'square' | 'star' | 'heart';
}

function createParticle(w: number, h: number, mobile: boolean): Particle {
  const types: Particle['type'][] = ['square', 'star', 'heart'];
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.8,
    vy: -(Math.random() * 0.6 + 0.2),
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.05,
    size: mobile ? Math.random() * 3 + 3 : Math.random() * 6 + 4,
    alpha: Math.random() * 0.5 + 0.4,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    type: types[Math.floor(Math.random() * types.length)],
  };
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.color;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  if (p.type === 'square') {
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
  } else if (p.type === 'star') {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * p.size;
      const y = Math.sin(angle) * p.size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      const innerAngle = angle + Math.PI / 5;
      ctx.lineTo(Math.cos(innerAngle) * p.size * 0.4, Math.sin(innerAngle) * p.size * 0.4);
    }
    ctx.closePath();
    ctx.fill();
  } else {
    const s = p.size * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, s);
    ctx.bezierCurveTo(s * 2, -s, s * 3, s, 0, s * 2.5);
    ctx.bezierCurveTo(-s * 3, s, -s * 2, -s, 0, s);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

export function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const animIdRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mobile = isMobile();
    const count = particleCount();

    const syncCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const init = () => {
      syncCanvas();
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      particlesRef.current = Array.from({ length: count }, () => createParticle(w, h, mobile));
    };

    const loop = () => {
      if (document.hidden) {
        animIdRef.current = requestAnimationFrame(loop);
        return;
      }
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        if (p.y < -20) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        drawParticle(ctx, p);
      }

      animIdRef.current = requestAnimationFrame(loop);
    };

    init();
    animIdRef.current = requestAnimationFrame(loop);

    const ro = new ResizeObserver(init);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      ro.disconnect();
    };
  }, [canvasRef]);
}
