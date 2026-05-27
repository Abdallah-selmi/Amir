import { useState, useEffect } from 'react';
import { isMobile, isTablet } from '../utils/device';

export function useResponsive() {
  const [mobile, setMobile] = useState(isMobile());
  const [tablet, setTablet] = useState(isTablet());

  useEffect(() => {
    const update = () => {
      setMobile(isMobile());
      setTablet(isTablet());
    };
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  return { mobile, tablet, desktop: !mobile && !tablet };
}
