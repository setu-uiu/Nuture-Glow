"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface StaggerProps {
  children?: React.ReactNode;
  delay?: number;
  staggerDelay?: number;
  threshold?: number;
}

// Using React.FC to properly support standard React props like 'key' in strict TS environments
export const Stagger: React.FC<StaggerProps> = ({ 
  children, 
  delay = 0, 
  staggerDelay = 0.12,
  threshold = 0.1
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps {
  children?: React.ReactNode;
  y?: number;
}

// Using React.FC to properly support standard React props like 'key' in strict TS environments
export const StaggerItem: React.FC<StaggerItemProps> = ({ children, y = 24 }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: { 
          opacity: 0, 
          y: shouldReduceMotion ? 0 : y 
        },
        visible: { 
          opacity: 1, 
          y: 0 
        }
      }}
      transition={{ 
        ease: [0.22, 1, 0.36, 1], 
        duration: shouldReduceMotion ? 0.3 : 0.8 
      }}
    >
      {children}
    </motion.div>
  );
};
