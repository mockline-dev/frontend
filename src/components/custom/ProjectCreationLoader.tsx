'use client';

import { GenerationProgress, Project } from '@/types/feathers';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CheckCircle2, Code2, Cpu, FileCode2, Layers, RotateCcw, Sparkles, Zap } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface ProjectCreationLoaderProps {
    status: 'idle' | 'creating' | 'generating' | 'ready' | 'error';
    project: Project | null;
    progress: GenerationProgress | null;
    error: string | null;
    onRetry?: () => void;
    onBackToDashboard?: () => void;
    onCancel?: () => void;
}

const STAGES = [
    { icon: Cpu, label: 'Analyzing prompt', key: 'analyzing' },
    { icon: Layers, label: 'Planning architecture', key: 'planning' },
    { icon: FileCode2, label: 'Generating files', key: 'generating' },
    { icon: Code2, label: 'Validating code', key: 'validating' },
    { icon: Zap, label: 'Finalizing project', key: 'finalizing' }
];

const TECH_WORDS = [
    'FastAPI',
    'Python',
    'REST API',
    'SQLAlchemy',
    'Pydantic',
    'JWT',
    'OAuth2',
    'PostgreSQL',
    'Redis',
    'Docker',
    'Middleware',
    'Endpoints',
    'Schema',
    'Model',
    'Router',
    'Service',
    'Database',
    'Auth',
    'CORS',
    'WebSocket'
];

// Skeleton shimmer effect component
function SkeletonShimmer({ className }: { className?: string }) {
    return (
        <motion.div className={`relative overflow-hidden ${className}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
        </motion.div>
    );
}

// Skeleton card for file preview
function FileSkeleton({ index }: { index: number }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: prefersReducedMotion ? 0 : 0.4 }}
            className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg"
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

// Enhanced floating particle with trail effect
function FloatingParticle({ index }: { index: number }) {
    const prefersReducedMotion = useReducedMotion();

    // Seeded pseudo-random number generator to avoid impure function warnings
    const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    // Use index-based seeding for consistent, deterministic values
    const particleProps = useMemo(
        () => ({
            size: seededRandom(index * 1) * 3 + 1,
            x: seededRandom(index * 2) * 100,
            duration: seededRandom(index * 3) * 8 + 6,
            delay: seededRandom(index * 4) * 4,
            opacity: seededRandom(index * 5) * 0.4 + 0.1
        }),
        [index]
    );

    return (
        <motion.div
            className="absolute rounded-full bg-violet-400"
            style={{
                width: particleProps.size,
                height: particleProps.size,
                left: `${particleProps.x}%`,
                bottom: '-4px',
                opacity: particleProps.opacity
            }}
            animate={prefersReducedMotion ? { y: -100, opacity: 0 } : { y: [0, -700], opacity: [particleProps.opacity, 0] }}
            transition={{ duration: prefersReducedMotion ? 2 : particleProps.duration, delay: particleProps.delay, repeat: Infinity, ease: 'linear' }}
        />
    );
}

// Enhanced code stream with syntax highlighting simulation
function CodeStream() {
    const [lines, setLines] = useState<string[]>([]);
    const frameRef = useRef<NodeJS.Timeout | null>(null);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        const codeSnippets = [
            'from fastapi import FastAPI, HTTPException',
            'from sqlalchemy import create_engine',
            'app = FastAPI(title="Generated API")',
            '@router.get("/users/{id}")',
            'async def get_user(id: int, db: Session):',
            'class UserModel(BaseModel):',
            '    email: EmailStr',
            '    hashed_password: str',
            'def verify_token(token: str) -> dict:',
            '    return jwt.decode(token, SECRET_KEY)',
            'engine = create_engine(DATABASE_URL)',
            'SessionLocal = sessionmaker(bind=engine)',
            'CORS(app, origins=["*"])',
            '@app.on_event("startup")',
            'async def startup_event():',
            '    await database.connect()',
            'class AuthService:',
            '    async def login(self, body: LoginDto):'
        ];

        const addLine = () => {
            const snippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
            setLines((prev) => {
                const sliced = prev.slice(-12);
                // Filter out any undefined values (shouldn't happen but TypeScript needs it)
                const filtered = sliced.filter((line): line is string => line !== undefined);
                return [...filtered, snippet];
            });
            frameRef.current = setTimeout(addLine, Math.random() * 600 + 200);
        };

        frameRef.current = setTimeout(addLine, 300);
        return () => {
            if (frameRef.current) clearTimeout(frameRef.current);
        };
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden opacity-[0.07] pointer-events-none select-none">
            <div className="font-mono text-[11px] leading-5 text-violet-300 p-6 space-y-0.5">
                {lines.map((line, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}>
                        {line}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// Tech word bubble with enhanced animations
function TechWordBubble() {
    const [word, setWord] = useState(TECH_WORDS[0]);
    const [visible, setVisible] = useState(true);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        const cycle = () => {
            setVisible(false);
            setTimeout(() => {
                setWord(TECH_WORDS[Math.floor(Math.random() * TECH_WORDS.length)]);
                setVisible(true);
            }, 300);
        };
        const interval = setInterval(cycle, 1800);
        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence mode="wait">
            {visible && (
                <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
                    className="inline-block font-mono text-violet-400 font-semibold"
                >
                    {word}
                </motion.span>
            )}
        </AnimatePresence>
    );
}

// Circular progress indicator
function CircularProgress({ percentage, size = 80, strokeWidth = 6 }: { percentage: number; size?: number; strokeWidth?: number }) {
    const prefersReducedMotion = useReducedMotion();
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            {/* Background circle */}
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="none" />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
                    style={{ strokeDasharray: circumference }}
                />
                {/* Gradient definition */}
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="50%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                </defs>
            </svg>
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.span className="text-lg font-bold text-white" animate={prefersReducedMotion ? {} : { scale: [1, 1.05, 1] }} transition={{ duration: 0.3 }}>
                    {Math.round(percentage)}%
                </motion.span>
            </div>
        </div>
    );
}

// Pulse ring effect
function PulseRing({ active }: { active: boolean }) {
    const prefersReducedMotion = useReducedMotion();

    if (!active) return null;

    return (
        <motion.div
            className="absolute inset-0 rounded-full border-2 border-violet-400/30"
            animate={
                prefersReducedMotion
                    ? { scale: 1, opacity: 0.5 }
                    : {
                          scale: [1, 1.5],
                          opacity: [0.5, 0]
                      }
            }
            transition={{ duration: prefersReducedMotion ? 0 : 1.5, repeat: Infinity }}
        />
    );
}

// Staggered animation wrapper
function StaggeredChildren({ children, delay = 0.05 }: { children: React.ReactNode; delay?: number }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <>
            {React.Children.map(children, (child, i) => (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: i * delay,
                        duration: prefersReducedMotion ? 0 : 0.3,
                        ease: 'easeOut'
                    }}
                >
                    {child}
                </motion.div>
            ))}
        </>
    );
}

// Main Project Creation Loader Component
export function ProjectCreationLoader({ status, project, progress, error, onRetry, onBackToDashboard, onCancel }: ProjectCreationLoaderProps) {
    const isActive = status === 'creating' || status === 'generating';
    const isError = status === 'error';
    const isReady = status === 'ready';
    const percentage = Math.min(100, Math.round(progress?.percentage || 0));
    const prefersReducedMotion = useReducedMotion();

    const activeStageIndex = Math.min(STAGES.length - 1, Math.floor((percentage / 100) * STAGES.length));

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 24, scale: 0.97 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: prefersReducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const glowVariants = {
        active: {
            opacity: [0.6, 1, 0.6],
            transition: { duration: 2, repeat: Infinity }
        },
        inactive: { opacity: 0 }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background particles */}
            <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 24 }).map((_, i) => (
                    <FloatingParticle key={i} index={i} />
                ))}
            </div>

            {/* Ambient glow effects */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-800/8 blur-[80px] pointer-events-none" />

            {/* Additional animated glow for active state */}
            <AnimatePresence>
                {isActive && !prefersReducedMotion && (
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                )}
            </AnimatePresence>

            {/* Grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)',
                    backgroundSize: '48px 48px'
                }}
            />

            {/* Main card */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative w-full max-w-lg">
                {/* Border glow */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            className="absolute -inset-px rounded-2xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(139,92,246,0.4) 0%, transparent 40%, transparent 60%, rgba(139,92,246,0.2) 100%)'
                            }}
                            variants={glowVariants}
                            animate="active"
                        />
                    )}
                </AnimatePresence>

                <div className="relative bg-[#0f0f1a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
                    {/* Code stream background */}
                    {isActive && <CodeStream />}

                    <div className="p-8 relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-5 h-5 rounded bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-violet-400" />
                                    </div>
                                    <span className="text-[11px] font-medium text-violet-400 tracking-widest uppercase">Mockline AI</span>
                                </div>
                                <h1 className="text-[22px] font-semibold text-white tracking-tight mt-2">
                                    {isError ? 'Build failed' : isReady ? 'Ready to code' : 'Building your backend'}
                                </h1>
                                {project?.name && <p className="text-[13px] text-white/40 mt-0.5 font-mono truncate max-w-xs">{project.name.slice(0, 50)}</p>}
                            </div>

                            {/* Status indicator with pulse */}
                            <div className="relative">
                                <PulseRing active={isActive} />
                                <div
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${
                                        isError
                                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                            : isReady
                                              ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                              : 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                                    }`}
                                >
                                    {isActive && !prefersReducedMotion && (
                                        <motion.span
                                            className="w-1.5 h-1.5 rounded-full bg-violet-400"
                                            animate={{ opacity: [1, 0.3, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        />
                                    )}
                                    {isError && <AlertCircle className="w-3 h-3" />}
                                    {isReady && <CheckCircle2 className="w-3 h-3" />}
                                    {isActive ? 'Running' : isError ? 'Error' : isReady ? 'Complete' : 'Starting'}
                                </div>
                            </div>
                        </div>

                        {/* Progress section with circular indicator */}
                        {!isError && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[11px] text-white/30 font-mono">
                                        {isActive ? <TechWordBubble /> : isReady ? 'All done' : 'Initializing...'}
                                    </span>
                                    <span className="text-[11px] font-mono font-semibold text-white/60">{percentage}%</span>
                                </div>

                                {/* Linear progress bar with shimmer */}
                                <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden mb-4">
                                    <motion.div
                                        className="h-full rounded-full relative"
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
                                        style={{
                                            background: isReady ? '#22c55e' : 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 50%, #7c3aed 100%)',
                                            backgroundSize: '200% 100%'
                                        }}
                                    >
                                        {/* Shimmer effect on progress bar */}
                                        {!prefersReducedMotion && isActive && (
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                animate={{ x: ['-100%', '200%'] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                            />
                                        )}
                                    </motion.div>
                                </div>

                                {/* Circular progress indicator */}
                                <div className="flex justify-center mb-4">
                                    <CircularProgress percentage={percentage} size={64} strokeWidth={5} />
                                </div>
                            </div>
                        )}

                        {/* Stage steps with staggered animations */}
                        {!isError && (
                            <div className="space-y-2 mb-6">
                                <StaggeredChildren delay={0.07}>
                                    {STAGES.map((stage, i) => {
                                        const StageIcon = stage.icon;
                                        const isDone = isReady || i < activeStageIndex;
                                        const isCurrentStage = !isReady && i === activeStageIndex && isActive;
                                        const isPending = !isReady && i > activeStageIndex;

                                        return (
                                            <motion.div
                                                key={stage.key}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                                                    isCurrentStage
                                                        ? 'bg-violet-500/10 border border-violet-500/20 shadow-lg shadow-violet-500/5'
                                                        : isDone
                                                          ? 'bg-white/[0.03]'
                                                          : 'opacity-30'
                                                }`}
                                                whileHover={isCurrentStage ? { scale: 1.02 } : {}}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div
                                                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 relative ${
                                                        isDone
                                                            ? 'bg-green-500/15 border border-green-500/20'
                                                            : isCurrentStage
                                                              ? 'bg-violet-500/20 border border-violet-500/30'
                                                              : 'bg-white/5 border border-white/10'
                                                    }`}
                                                >
                                                    {/* Pulse effect for current stage */}
                                                    {isCurrentStage && !prefersReducedMotion && (
                                                        <motion.div
                                                            className="absolute inset-0 rounded-md bg-violet-500/20"
                                                            animate={{
                                                                scale: [1, 1.3],
                                                                opacity: [0.5, 0]
                                                            }}
                                                            transition={{ duration: 1.5, repeat: Infinity }}
                                                        />
                                                    )}
                                                    {isDone ? (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                        </motion.div>
                                                    ) : isCurrentStage ? (
                                                        <motion.div
                                                            animate={!prefersReducedMotion ? { rotate: 360 } : {}}
                                                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                                        >
                                                            <StageIcon className="w-4 h-4 text-violet-400" />
                                                        </motion.div>
                                                    ) : (
                                                        <StageIcon className={`w-4 h-4 ${isPending ? 'text-white/20' : 'text-white/50'}`} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span
                                                        className={`text-[12px] font-medium transition-colors duration-300 ${
                                                            isDone ? 'text-white/60' : isCurrentStage ? 'text-white/90' : 'text-white/25'
                                                        }`}
                                                    >
                                                        {stage.label}
                                                    </span>
                                                </div>
                                                {isCurrentStage && !prefersReducedMotion && (
                                                    <div className="flex gap-0.5">
                                                        {[0, 1, 2].map((dot) => (
                                                            <motion.span
                                                                key={dot}
                                                                className="w-1 h-1 rounded-full bg-violet-400"
                                                                animate={{ opacity: [0.2, 1, 0.2] }}
                                                                transition={{ duration: 0.8, delay: dot * 0.2, repeat: Infinity }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </StaggeredChildren>
                            </div>
                        )}

                        {/* File skeleton preview for active state */}
                        {isActive && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] text-white/40 font-medium">Generating files...</span>
                                    {progress && progress.totalFiles > 0 && (
                                        <span className="text-[11px] font-mono font-semibold text-white/70">
                                            {progress.filesGenerated} <span className="text-white/30">/</span> {progress.totalFiles}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {[0, 1, 2].map((i) => (
                                        <FileSkeleton key={i} index={i} />
                                    ))}
                                </div>
                                {progress?.currentStage && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-white/25 font-mono mt-2 truncate">
                                        {progress.currentStage.replace(/_/g, ' ')}
                                    </motion.p>
                                )}
                            </div>
                        )}

                        {/* File progress bar */}
                        {isActive && progress && progress.totalFiles > 0 && (
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 mb-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] text-white/40">Files generated</span>
                                    <span className="text-[11px] font-mono font-semibold text-white/70">
                                        {progress.filesGenerated} <span className="text-white/30">/</span> {progress.totalFiles}
                                    </span>
                                </div>
                                <div className="h-[2px] bg-white/[0.05] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-violet-500 rounded-full relative"
                                        animate={{ width: `${(progress.filesGenerated / progress.totalFiles) * 100}%` }}
                                        transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
                                    >
                                        {/* Shimmer effect */}
                                        {!prefersReducedMotion && (
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                                animate={{ x: ['-100%', '200%'] }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            />
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {/* Error state with enhanced animation */}
                        {isError && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="bg-red-500/8 border border-red-500/15 rounded-xl p-4 mb-6"
                            >
                                <div className="flex items-start gap-3">
                                    <motion.div animate={!prefersReducedMotion ? { rotate: [0, -10, 10, -10, 0] } : {}} transition={{ duration: 0.5 }}>
                                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                    </motion.div>
                                    <div>
                                        <p className="text-[12px] text-red-300 font-medium mb-0.5">Build error</p>
                                        <p className="text-[11px] text-red-400/70 leading-relaxed">{error || 'An unexpected error occurred. Please try again.'}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Ready state with success animation */}
                        {isReady && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                className="bg-green-500/8 border border-green-500/15 rounded-xl p-4 mb-6 flex items-center gap-3"
                            >
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.1 }}>
                                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                                </motion.div>
                                <div>
                                    <p className="text-[12px] text-green-300 font-medium">Project ready</p>
                                    <p className="text-[11px] text-green-400/60">Loading workspace...</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Action buttons with hover effects */}
                        {(isError || isActive) && (
                            <div className="flex items-center gap-2">
                                {isError && onRetry && (
                                    <motion.button
                                        onClick={onRetry}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-medium transition-colors shadow-lg shadow-violet-600/20"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Retry
                                    </motion.button>
                                )}
                                {onBackToDashboard && (
                                    <motion.button
                                        onClick={onBackToDashboard}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white text-[12px] font-medium transition-colors border border-white/[0.08]"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        Dashboard
                                    </motion.button>
                                )}
                                {isActive && onCancel && (
                                    <motion.button
                                        onClick={onCancel}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="h-9 px-4 rounded-lg text-white/30 hover:text-white/60 text-[12px] transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                )}
                            </div>
                        )}

                        {/* Footer */}
                        {isActive && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-[10px] text-white/20 text-center mt-5"
                            >
                                This usually takes 30–90 seconds depending on project complexity
                            </motion.p>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
