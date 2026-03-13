'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { useState } from 'react';

import type { ProgressUpdate } from './hooks/useProgressStream';

interface ProgressIndicatorProps {
    progress: ProgressUpdate | null;
    isConnected: boolean;
    onCancel?: () => void;
    error?: Error | null;
}

export function ProgressIndicator({ progress, isConnected, onCancel, error }: ProgressIndicatorProps) {
    const [expanded, setExpanded] = useState(false);

    if (!progress && !error) return null;

    const isError = !!error;
    const isComplete = progress?.percentage === 100;

    return (
        <motion.div
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
        >
            <div
                className={cn(
                    'backdrop-blur-xl rounded-2xl shadow-2xl border overflow-hidden',
                    isError
                        ? 'bg-red-50/90 border-red-200'
                        : isComplete
                          ? 'bg-green-50/90 border-green-200'
                          : 'bg-white/90 border-black/10'
                )}
            >
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            {isError ? (
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                </div>
                            ) : isComplete ? (
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
                                </div>
                            )}
                            <AnimatePresence>
                                {isConnected && !isError && !isComplete && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-violet-500/20"
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm truncate">
                                    {isError ? 'Generation Failed' : isComplete ? 'Generation Complete' : progress?.stage || 'Processing'}
                                </h3>
                                {!isError && !isComplete && (
                                    <span className="text-xs font-mono px-2 py-0.5 bg-black/5 rounded-full">
                                        {Math.round(progress?.percentage || 0)}%
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-black/60 mt-0.5 truncate">
                                {isError ? error?.message : progress?.message || 'In progress...'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isError && !isComplete && onCancel && (
                            <button
                                onClick={onCancel}
                                className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                                aria-label="Cancel generation"
                            >
                                <X className="w-4 h-4 text-black/60" />
                            </button>
                        )}
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                            aria-label={expanded ? 'Collapse' : 'Expand details'}
                        >
                            <motion.svg
                                className="w-4 h-4 text-black/60"
                                animate={{ rotate: expanded ? 180 : 0 }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </motion.svg>
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                {!isError && !isComplete && (
                    <div className="px-4 pb-3">
                        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress?.percentage || 0}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                )}

                {/* Expanded details */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-black/5"
                        >
                            <div className="p-4 space-y-3">
                                {progress?.currentFile && (
                                    <div>
                                        <p className="text-xs font-medium text-black/40 mb-1">Current File</p>
                                        <p className="text-sm font-mono text-black/70 bg-black/[0.02] px-2 py-1 rounded">
                                            {progress.currentFile}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs font-medium text-black/40 mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                'w-2 h-2 rounded-full',
                                                isConnected ? 'bg-green-500' : 'bg-red-500'
                                            )}
                                        />
                                        <span className="text-sm text-black/70">
                                            {isConnected ? 'Connected' : 'Disconnected'}
                                        </span>
                                    </div>
                                </div>
                                {progress?.timestamp && (
                                    <div>
                                        <p className="text-xs font-medium text-black/40 mb-1">Last Update</p>
                                        <p className="text-sm text-black/70">
                                            {new Date(progress.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}
