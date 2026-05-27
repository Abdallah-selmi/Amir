export const isMobile  = () => window.innerWidth < 768;
export const isTablet  = () => window.innerWidth >= 768 && window.innerWidth < 1024;
export const isDesktop = () => window.innerWidth >= 1024;
export const isIOS     = () => /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const isAndroid = () => /Android/.test(navigator.userAgent);
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const particleCount = () => isMobile() ? 40 : 80;
export const balloonCount  = () => isMobile() ? 6 : 10;
