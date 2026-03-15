/**
 * Circular Progress Component
 * Enhanced circular progress with better visual feedback
 */

'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface CircularProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
}

export function CircularProgress({ percentage, size = 72, strokeWidth = 5 }: CircularProgressProps) {
    const prefersReducedMotion = useReducedMotion();
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: 'easeOut' }}
                    style={{ strokeDasharray: circumference }}
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="50%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                    className="text-[15px] font-bold text-white"
                    animate={prefersReducedMotion ? {} : { scale: [1, 1.03, 1] }}
                    transition={{ duration: 0.25 }}
                >
                    {Math.round(percentage)}%
                </motion.span>
            </div>
        </div>
    );
}
