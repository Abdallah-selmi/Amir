import type { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit:    { opacity: 0, transition: { duration: 0.3 } },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  exit:    { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
};

export const slideUp: Variants = {
  hidden:  { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 250, damping: 20 } },
  exit:    { opacity: 0, y: 60, transition: { duration: 0.2 } },
};

export const letterVariants: Variants = {
  hidden:  { y: 100, opacity: 0, scale: 0.5 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.18,
      type: 'spring',
      stiffness: 280,
      damping: 18,
    },
  }),
};

export const bounceIn: Variants = {
  hidden:  { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    },
  },
};

export const popOut: Variants = {
  hidden:  { scale: 1, opacity: 1 },
  visible: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};
