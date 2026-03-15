/**
 * File Skeleton Component
 * Improved file skeleton with better visual feedback
 */

'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { SkeletonShimmer } from './SkeletonShimmer';

interface FileSkeletonProps {
    index: number;
    delay?: number;
}

export function FileSkeleton({ index, delay = 0 }: FileSkeletonProps) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: delay + index * 0.06,
                duration: prefersReducedMotion ? 0 : 0.35,
                ease: [0.22, 1, 0.36, 1]
            }}
            className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg hover:bg-white/[0.04] transition-colors"
        >
            <SkeletonShimmer className="w-8 h-8 rounded-md" />
            <div className="flex-1 space-y-1.5">
                <SkeletonShimmer className="h-2.5 w-3/4 rounded" />
                <SkeletonShimmer className="h-1.5 w-1/2 rounded" />
            </div>
            <SkeletonShimmer className="w-6 h-6 rounded" />
        </motion.div>
    );
}
