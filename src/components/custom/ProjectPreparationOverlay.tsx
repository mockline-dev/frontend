import { ProjectCreationState } from '@/hooks/useProjectCreation';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProjectPreparationOverlayProps {
    visible: boolean;
    state: ProjectCreationState;
}

const STAGES = [
    { id: 'initializing', label: 'Initializing Workspace' },
    { id: 'generating', label: 'Generating Application Code' },
    { id: 'validating', label: 'Validating and Checking Types' },
    { id: 'ready', label: 'Preparing Workspace' }
];

const toStageLabel = (stage: string | undefined): string => {
    if (!stage) return 'Working...';
    const normalized = stage.replace(/[_-]/g, ' ').trim();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export default function ProjectPreparationOverlay({ visible, state }: ProjectPreparationOverlayProps) {
    const [showLoader, setShowLoader] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => setShowLoader(true), 500);
            const interval = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
            return () => {
                clearTimeout(timer);
                clearInterval(interval);
            };
        } else {
            setShowLoader(false);
            setElapsedSeconds(0);
        }
    }, [visible]);

    if (!visible || !showLoader) return null;

    const percent = Math.max(0, Math.min(100, Math.round(state.progress?.percentage || 0)));
    const fileProgress = state.progress && state.progress.totalFiles > 0 
        ? `${state.progress.filesGenerated} of ${state.progress.totalFiles} files` 
        : null;

    const currentStageId = state.progress?.currentStage || 'initializing';
    
    // Determine active index for stage dots
    let activeStageIndex = 0;
    if (currentStageId.includes('generating')) activeStageIndex = 1;
    else if (currentStageId.includes('validating')) activeStageIndex = 2;
    else if (currentStageId.includes('complete') || currentStageId === 'ready') activeStageIndex = 3;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 border"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div 
                        className="w-full max-w-md rounded-2xl border border-white dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-2xl shadow-2xl p-6 md:p-8 space-y-6 relative overflow-hidden"
                        initial={{ scale: 0.95, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Glowing Background Accent */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -z-10" />

                        {/* Heading & Timer */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground">Building Project</h2>
                            <div className="flex items-center gap-1.5 bg-secondary/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-xs font-mono font-medium text-muted-foreground">{elapsedSeconds}s</span>
                            </div>
                        </div>

                        {/* Progress Bar with Gradient */}
                        <div className="space-y-2">
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
                                <span className="font-semibold text-primary">{percent}%</span>
                                <span>{fileProgress || toStageLabel(state.progress?.currentStage)}</span>
                            </div>
                        </div>

                        {/* Stages Tracker */}
                        <div className="space-y-3 pt-2">
                            {STAGES.map((stage, index) => {
                                const isCompleted = index < activeStageIndex;
                                const isActive = index === activeStageIndex;

                                return (
                                    <motion.div 
                                        key={stage.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                            isActive 
                                                ? 'bg-secondary/70 border border-white/10 shadow-sm' 
                                                : isCompleted 
                                                    ? 'opacity-80' 
                                                    : 'opacity-40'
                                        }`}
                                        initial={false}
                                        animate={{ 
                                            scale: isActive ? 1.01 : 1,
                                            x: isActive ? 4 : 0
                                        }}
                                        transition={{ type: "spring" }}
                                    >
                                        <div className="flex-shrink-0">
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                                            ) : isActive ? (
                                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-muted-foreground/60" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {stage.label}
                                            </p>
                                        </div>
                                        {isActive && fileProgress && (
                                            <span className="text-xs font-mono font-medium opacity-70 bg-background/50 px-2 py-0.5 rounded-md border border-white/5">
                                                {state.progress?.filesGenerated}/{state.progress?.totalFiles}
                                            </span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
