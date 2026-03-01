"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface RevealProps {
  children?: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  duration?: number;
  y?: number;
  threshold?: number;
}

// Using React.FC to properly support standard React props like 'key' in strict TS environments
export const Reveal: React.FC<RevealProps> = ({ 
  children, 
  width = "100%", 
  delay = 0, 
  duration = 0.9,
  y = 40,
  threshold = 0.2
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      style={{ width, position: 'relative' }}
      initial={{ 
        opacity: 0, 
        y: shouldReduceMotion ? 0 : y 
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0 
      }}
      viewport={{ 
        once: true, 
        amount: threshold 
      }}
      transition={{ 
        duration: shouldReduceMotion ? 0.4 : duration, 
        delay, 
        ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for "premium" feel
      }}
    >
      {children}
    </motion.div>
  );
};