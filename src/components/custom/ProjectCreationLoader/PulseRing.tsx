/**
 * Pulse Ring Component
 * Smooth pulse ring effect
 */

'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface PulseRingProps {
    active: boolean;
    color?: 'violet' | 'green' | 'red';
}

export function PulseRing({ active, color = 'violet' }: PulseRingProps) {
    const prefersReducedMotion = useReducedMotion();

    if (!active) return null;

    const colors = {
        violet: 'border-violet-400/30',
        green: 'border-green-400/30',
        red: 'border-red-400/30'
    };

    return (
        <motion.div
            className={`absolute inset-0 rounded-full border-2 ${colors[color]}`}
            animate={
                prefersReducedMotion
                    ? { scale: 1, opacity: 0.4 }
                    : {
                        scale: [1, 1.4],
                        opacity: [0.4, 0]
                    }
            }
            transition={{ duration: prefersReducedMotion ? 0 : 1.8, repeat: Infinity }}
        />
    );
}
