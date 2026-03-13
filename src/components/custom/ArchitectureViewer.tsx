'use client';

import type { Architecture } from '@/types/feathers';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2, Minimize2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

import { ArchitectureGraph } from './ArchitectureGraph';

interface ArchitectureViewerProps {
    architecture: Architecture | null;
    loading?: boolean;
    error?: string | null;
    onRefresh?: () => void;
    onClose?: () => void;
    isOpen?: boolean;
}

export function ArchitectureViewer({
    architecture,
    loading,
    error,
    onRefresh,
    onClose,
    isOpen = false
}: ArchitectureViewerProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={cn(
                        'absolute bg-[#09090f] border border-white/10 shadow-2xl overflow-hidden',
                        isFullscreen ? 'inset-4' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[80vh] rounded-2xl'
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 z-10 bg-[#09090f]/95 backdrop-blur border-b border-white/10 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold text-white">Architecture Visualization</h2>
                            {architecture && (
                                <div className="flex items-center gap-4 text-xs text-white/60">
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                        {architecture.models.length} models
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-violet-400" />
                                        {architecture.services.length} services
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                                        {architecture.routes.length} routes
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="w-4 h-4 text-white/60" />
                                ) : (
                                    <Maximize2 className="w-4 h-4 text-white/60" />
                                )}
                            </button>
                            {onRefresh && (
                                <button
                                    onClick={onRefresh}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Refresh architecture"
                                >
                                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X className="w-4 h-4 text-white/60" />
                            </button>
                        </div>
                    </div>

                    {/* Architecture graph */}
                    <div className="h-full">
                        <ArchitectureGraph
                            architecture={architecture}
                            loading={loading}
                            error={error}
                            onRefresh={onRefresh}
                        />
                    </div>

                    {/* Zoom controls */}
                    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
                        <button
                            className="p-2 bg-[#0f172a] border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                            title="Zoom in"
                        >
                            <ZoomIn className="w-4 h-4 text-white/60" />
                        </button>
                        <button
                            className="p-2 bg-[#0f172a] border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                            title="Zoom out"
                        >
                            <ZoomOut className="w-4 h-4 text-white/60" />
                        </button>
                    </div>

                    {/* Legend */}
                    {architecture && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-4 left-4 z-10 bg-[#0f172a] border border-white/10 rounded-lg p-3"
                        >
                            <p className="text-[10px] text-white/40 font-medium mb-2">Legend</p>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-cyan-400" />
                                    <span className="text-[11px] text-white/70">Models</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-violet-400" />
                                    <span className="text-[11px] text-white/70">Services</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-amber-400" />
                                    <span className="text-[11px] text-white/70">Routes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded border-2 border-dashed border-amber-400" />
                                    <span className="text-[11px] text-white/70">Dependencies</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}
