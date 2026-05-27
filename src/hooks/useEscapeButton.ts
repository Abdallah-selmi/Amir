import { useState, useRef, useCallback, useEffect } from 'react';
import { isMobile } from '../utils/device';
import { ESCAPE_MESSAGES } from '../utils/constants';

interface EscapeState {
  x: number;
  y: number;
  escapeCount: number;
  isClickable: boolean;
  message: string | null;
}

function clamp(min: number, max: number, val: number) {
  return Math.min(max, Math.max(min, val));
}

export function useEscapeButton(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState<EscapeState>({
    x: 50,
    y: 65,
    escapeCount: 0,
    isClickable: false,
    message: null,
  });

  const wasNear = useRef(false);
  const cooldownRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;

    const s = stateRef.current;
    if (s.isClickable) return;

    const rect = container.getBoundingClientRect();
    const cx = ((clientX - rect.left) / rect.width) * 100;
    const cy = ((clientY - rect.top) / rect.height) * 100;

    const dx = cx - s.x;
    const dy = cy - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const threshold = isMobile() ? 15 : 12;

    if (dist < threshold && !wasNear.current && !cooldownRef.current) {
      wasNear.current = true;
      cooldownRef.current = true;
      setTimeout(() => { cooldownRef.current = false; }, 500);

      const newCount = s.escapeCount + 1;
      const isClickable = newCount >= 3;

      if (!isClickable) {
        const escapeDistance = isMobile() ? 30 : 38;
        const angle = Math.atan2(s.y - cy, s.x - cx);
        const rawX = s.x + Math.cos(angle) * escapeDistance + (Math.random() - 0.5) * 16;
        const rawY = s.y + Math.sin(angle) * escapeDistance + (Math.random() - 0.5) * 10;
        const newX = isMobile() ? clamp(30, 70, rawX) : clamp(12, 88, rawX);
        const newY = clamp(15, 82, rawY);

        setState({
          x: newX,
          y: newY,
          escapeCount: newCount,
          isClickable: false,
          message: ESCAPE_MESSAGES[newCount - 1] ?? null,
        });

        setTimeout(() => {
          setState(prev => ({ ...prev, message: null }));
        }, 1800);
      } else {
        setState(prev => ({ ...prev, escapeCount: newCount, isClickable: true, message: null }));
      }
    } else if (dist >= threshold) {
      wasNear.current = false;
    }
  }, [containerRef]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) handlePointerMove(t.clientX, t.clientY);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [handlePointerMove]);

  return state;
}
