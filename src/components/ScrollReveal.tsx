import { memo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

type RevealDirection = 'left' | 'right' | 'up' | 'down';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  distance?: number;
  blur?: number;
  className?: string;
  immediate?: boolean;
}

function ScrollRevealInner({
  children,
  direction = 'up',
  delay = 0,
  distance = 28,
  blur = 0,
  className = '',
  immediate = false,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const clampedDistance = Math.min(32, distance);
  const offset =
    direction === 'left'
      ? { x: -clampedDistance, y: 0 }
      : direction === 'right'
        ? { x: clampedDistance, y: 0 }
        : direction === 'down'
          ? { x: 0, y: -clampedDistance }
          : { x: 0, y: clampedDistance };

  const isMobileViewport =
    typeof window !== 'undefined' && window.innerWidth < 768;
  const effectiveBlur = isMobileViewport ? 0 : Math.min(4, blur);

  const initial =
    effectiveBlur > 0
      ? {
          opacity: 0,
          x: offset.x,
          y: offset.y,
          filter: `blur(${effectiveBlur}px)`,
        }
      : {
          opacity: 0,
          x: offset.x,
          y: offset.y,
        };

  const target =
    effectiveBlur > 0
      ? {
          opacity: 1,
          x: 0,
          y: 0,
          filter: 'blur(0px)',
        }
      : {
          opacity: 1,
          x: 0,
          y: 0,
        };

  const transition = {
    duration: 0.46,
    delay: Math.min(0.24, delay),
    ease: [0.16, 1, 0.3, 1] as const,
  };

  if (immediate) {
    return (
      <motion.div
        initial={initial}
        animate={target}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={initial}
      whileInView={target}
      viewport={{ once: true, amount: 0.04 }}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const ScrollReveal = memo(ScrollRevealInner);
