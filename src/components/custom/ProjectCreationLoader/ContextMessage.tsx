/**
 * Context Message Component
 * Context-aware message bubble
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CONTEXT_MESSAGES } from './constants';

interface ContextMessageProps {
    stage: string;
}

export function ContextMessage({ stage }: ContextMessageProps) {
    const [messageIndex, setMessageIndex] = useState(0);
    const prefersReducedMotion = useReducedMotion();
    const messages = CONTEXT_MESSAGES[stage] || ['Processing...'];

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [messages]);

    return (
        <AnimatePresence mode="wait">
            <motion.span
                key={messageIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                className="inline-block text-[11px] text-white/50 font-medium"
            >
                {messages[messageIndex]}
            </motion.span>
        </AnimatePresence>
    );
}
