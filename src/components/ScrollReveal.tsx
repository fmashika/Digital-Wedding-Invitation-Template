import type { ReactNode } from 'react';
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

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  distance = 40,
  blur = 10,
  className = '',
  immediate = false,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const offset =
    direction === 'left'
      ? { x: -distance, y: 0 }
      : direction === 'right'
        ? { x: distance, y: 0 }
        : direction === 'down'
          ? { x: 0, y: -distance }
          : { x: 0, y: distance };

  const initial = {
    opacity: 0,
    x: offset.x,
    y: offset.y,
    filter: `blur(${blur}px)`,
  };

  const target = {
    opacity: 1,
    x: 0,
    y: 0,
    filter: 'blur(0px)',
  };

  if (immediate) {
    return (
      <motion.div
        initial={initial}
        animate={target}
        transition={{
          duration: 0.72,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
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
      viewport={{ once: true, amount: 0.06 }}
      transition={{
        duration: 0.72,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
