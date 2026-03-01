"use client";

import React, { useEffect, ReactNode } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProviderProps {
  children?: ReactNode;
}

export const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  useEffect(() => {
    // Check if the user prefers reduced motion to disable smooth scrolling
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Premium easeOutExpo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.8,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Add lenis class to html for global styling hooks
    document.documentElement.classList.add('lenis-enabled');

    return () => {
      lenis.destroy();
      document.documentElement.classList.remove('lenis-enabled');
    };
  }, []);

  return <>{children}</>;
};