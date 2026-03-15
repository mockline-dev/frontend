/**
 * Floating Particle Component
 * Optimized floating particles with better performance
 */

'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

interface FloatingParticleProps {
    index: number;
}

export function FloatingParticle({ index }: FloatingParticleProps) {
    const prefersReducedMotion = useReducedMotion();

    const particleProps = useMemo(() => {
        const seed = index * 123.456;
        const random = (n: number) => {
            const x = Math.sin(seed + n) * 10000;
            return x - Math.floor(x);
        };

        return {
            size: random(1) * 2.5 + 0.8,
            x: random(2) * 100,
            duration: random(3) * 10 + 8,
            delay: random(4) * 3,
            opacity: random(5) * 0.3 + 0.08
        };
    }, [index]);

    return (
        <motion.div
            className="absolute rounded-full bg-violet-400/60"
            style={{
                width: particleProps.size,
                height: particleProps.size,
                left: `${particleProps.x}%`,
                bottom: '-4px',
                opacity: particleProps.opacity
            }}
            animate={
                prefersReducedMotion
                    ? { y: -80, opacity: 0 }
                    : { y: [0, -600], opacity: [particleProps.opacity, 0] }
            }
            transition={{
                duration: prefersReducedMotion ? 1.5 : particleProps.duration,
                delay: particleProps.delay,
                repeat: Infinity,
                ease: 'linear'
            }}
        />
    );
}
