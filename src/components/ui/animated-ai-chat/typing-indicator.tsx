'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1 h-1 bg-black/90 rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.15, ease: 'easeInOut' }}
                    style={{ boxShadow: '0 0 4px rgba(255, 255, 255, 0.3)' }}
                />
            ))}
        </div>
    );
}

export function TypingIndicator({
    isTyping,
    label = 'Processing',
    phases = [],
    phaseDuration = 2000,
    isMorphing = false,
    onMorphComplete
}: {
    isTyping: boolean;
    label?: string;
    phases?: string[];
    phaseDuration?: number;
    isMorphing?: boolean;
    onMorphComplete?: () => void;
}) {
    const [phaseIndex, setPhaseIndex] = useState(0);
    const phasesKey = phases.join('|');

    const hasPhases = isTyping && phases.length > 0;
    const displayLabel = hasPhases ? (phases[phaseIndex] ?? phases[0] ?? label) : label;

    useEffect(() => {
        if (!hasPhases) {
            return;
        }

        const lastPhaseIndex = phases.length - 1;
        const interval = setInterval(() => {
            setPhaseIndex((prev) => {
                if (prev >= lastPhaseIndex) {
                    clearInterval(interval);
                    return prev;
                }

                const next = prev + 1;
                if (next >= lastPhaseIndex) {
                    clearInterval(interval);
                }

                return next;
            });
        }, phaseDuration);

        return () => clearInterval(interval);
    }, [hasPhases, phasesKey, phaseDuration, phases.length]);

    return (
        <AnimatePresence mode="wait">
            {isTyping && !isMorphing && (
                <motion.div
                    className="fixed bottom-8 mx-auto transform backdrop-blur-2xl bg-black/3 rounded-full px-4 py-2.5 shadow-lg border border-black/8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                >
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Mocky Avatar" width={24} height={24} className="rounded-full" />
                        <div className="flex items-center gap-1 text-sm text-black/70">
                            <motion.span key={displayLabel} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                {displayLabel}
                            </motion.span>
                            <TypingDots />
                        </div>
                    </div>
                </motion.div>
            )}
            {isMorphing && (
                <motion.div
                    className="fixed inset-0 bg-white/95 backdrop-blur-xl flex items-center justify-center z-50"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    {...(onMorphComplete ? { onAnimationComplete: onMorphComplete } : {})}
                >
                    <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Mocky Avatar" width={32} height={32} className="rounded-full" />
                        <div className="flex items-center gap-1 text-lg text-black/70">
                            <motion.span key={displayLabel} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                {displayLabel}
                            </motion.span>
                            <TypingDots />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
