import React from 'react';
import { motion, type Variants } from 'framer-motion';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const pageVariants: Variants = {
  initial: { opacity: 0, x: prefersReducedMotion ? 0 : 24, filter: prefersReducedMotion ? 'blur(0px)' : 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: prefersReducedMotion ? 0 : -16, filter: prefersReducedMotion ? 'blur(0px)' : 'blur(2px)', transition: { duration: 0.25, ease: [0.55, 0.06, 0.68, 0.19] } },
};

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
