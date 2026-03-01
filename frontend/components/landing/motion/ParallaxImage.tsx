"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  strength?: number; // Higher number = more movement
}

export const ParallaxImage = ({ 
  src, 
  alt, 
  className = "", 
  strength = 30 
}: ParallaxImageProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Map scroll progress to subtle Y transformation
  const y = useTransform(
    scrollYProgress, 
    [0, 1], 
    shouldReduceMotion ? [0, 0] : [strength, -strength]
  );

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ 
          y, 
          scale: shouldReduceMotion ? 1 : 1.05 // Subtle scale for depth
        }}
        className="w-full h-full object-cover transition-opacity duration-700"
        loading="lazy"
      />
    </div>
  );
};