/**
 * Code Stream Component
 * Enhanced code stream with better visual presentation
 */

'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { CODE_SNIPPETS } from './constants';

export function CodeStream() {
    const [lines, setLines] = useState<string[]>([]);
    const frameRef = useRef<NodeJS.Timeout | null>(null);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        const addLine = () => {
            const snippet = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
            setLines((prev) => {
                const sliced = prev.slice(-10);
                const filtered = sliced.filter((line): line is string => line !== undefined);
                return [...filtered, snippet];
            });
            frameRef.current = setTimeout(addLine, Math.random() * 500 + 150);
        };

        frameRef.current = setTimeout(addLine, 200);
        return () => {
            if (frameRef.current) clearTimeout(frameRef.current);
        };
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden opacity-[0.06] pointer-events-none select-none">
            <div className="font-mono text-[10px] leading-5 text-violet-300 p-6 space-y-0.5">
                {lines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
                        className="truncate"
                    >
                        {line}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
