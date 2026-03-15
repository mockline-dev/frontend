/**
 * Time Estimate Component
 * Time estimation display
 */

'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { STAGES } from './constants';

interface TimeEstimateProps {
    stageIndex: number;
    isActive: boolean;
}

export function TimeEstimate({ stageIndex, isActive }: TimeEstimateProps) {
    if (!isActive || stageIndex >= STAGES.length) return null;

    const stage = STAGES[stageIndex];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 text-[10px] text-white/30"
        >
            <Clock className="w-3 h-3" />
            <span>{stage.estimatedTime}</span>
        </motion.div>
    );
}
