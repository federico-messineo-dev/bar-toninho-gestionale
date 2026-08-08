import { useEffect, useState } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.45,
} as const;

export const EASE = {
  default: [0.25, 0.46, 0.45, 0.94] as const,
  exit: [0.55, 0.06, 0.68, 0.19] as const,
  spring: { type: 'spring' as const, stiffness: 300, damping: 24 },
  gentle: { type: 'spring' as const, stiffness: 200, damping: 20 },
};
