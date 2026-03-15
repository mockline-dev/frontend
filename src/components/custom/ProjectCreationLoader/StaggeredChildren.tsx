/**
 * Staggered Children Component
 * Staggered animation wrapper with better timing
 */

'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggeredChildrenProps {
    children: ReactNode;
    delay?: number;
}

export function StaggeredChildren({ children, delay = 0.05 }: StaggeredChildrenProps) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <>
            {React.Children.map(children, (child, i) => (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: i * delay,
                        duration: prefersReducedMotion ? 0 : 0.3,
                        ease: [0.22, 1, 0.36, 1]
                    }}
                >
                    {child}
                </motion.div>
            ))}
        </>
    );
}
