/**
 * Skeleton Shimmer Component
 * Enhanced skeleton shimmer with smoother animation
 */

'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface SkeletonShimmerProps {
    className?: string;
}

export function SkeletonShimmer({ className }: SkeletonShimmerProps) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            className={`relative overflow-hidden ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            {!prefersReducedMotion && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                />
            )}
        </motion.div>
    );
}
