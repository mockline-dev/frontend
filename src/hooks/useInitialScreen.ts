'use client';

import { enhancePrompt } from '@/api/enhancePrompt/enhancePrompt';
import { inferProjectMeta } from '@/api/inferProjectMeta/inferProjectMeta';
import { defaultAiModel } from '@/config/environment';
import { useProjectCreation } from '@/hooks/useProjectCreation';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { appRoutes } from '@/config/appRoutes';

interface UseInitialScreenOptions {
    onProjectCreated?: (projectId: string) => void;
    currentUser?: any;
}

type PreparationPhase = 'idle' | 'enhancing' | 'inferring-meta';

const SAVED_PROMPT_KEY = 'savedPrompt';

export function useInitialScreen(options?: UseInitialScreenOptions) {
    const router = useRouter();
    const [promptValue, setPromptValue] = useState('');
    const [enhancedPrompt, setEnhancedPrompt] = useState('');
    const [enhanceLoading, setEnhanceLoading] = useState(false);
    const [preparationPhase, setPreparationPhase] = useState<PreparationPhase>('idle');

    const {
        state: creationState,
        createProject,
        isCreating
    } = useProjectCreation({
        onSuccess: (project) => {
            options?.onProjectCreated?.(project._id);
            router.push(`/workspace?projectId=${project._id}`);
        },
        onError: (error) => {
            toast.error(error);
        }
    });

    const handleEnhancePrompt = useCallback(async (prompt: string) => {
        try {
            setEnhanceLoading(true);
            const response = await enhancePrompt({ userPrompt: prompt });
            setEnhancedPrompt(response.enhancedPrompt);
        } catch (error) {
            console.error('Error enhancing prompt:', error);
            toast.error('Failed to enhance prompt');
        } finally {
            setEnhanceLoading(false);
        }
    }, []);

    const handleSendPrompt = useCallback(
        async (prompt: string) => {
            const normalizedPrompt = prompt.trim();
            if (!normalizedPrompt || isCreating || preparationPhase !== 'idle') {
                return;
            }

            // Check if user is authenticated
            if (!options?.currentUser) {
                // Save prompt to localStorage and redirect to auth
                if (typeof window !== 'undefined') {
                    localStorage.setItem(SAVED_PROMPT_KEY, normalizedPrompt);
                    // Also set a cookie to indicate that there's a saved prompt
                    // This will be used by the signIn service to redirect to home
                    document.cookie = `${SAVED_PROMPT_KEY}=true; path=/; max-age=3600`;
                }
                router.push(appRoutes.auth.login);
                return;
            }

            try {
                setPreparationPhase('inferring-meta');
                const metadata = await inferProjectMeta({ enhancedPrompt: normalizedPrompt });

                setPreparationPhase('idle');
                await createProject({
                    name: metadata.name?.trim() || (normalizedPrompt.length > 60 ? `${normalizedPrompt.slice(0, 57)}...` : normalizedPrompt),
                    description: metadata.description?.trim() || normalizedPrompt,
                    framework: 'fast-api',
                    language: 'python',
                    model: defaultAiModel
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to create project';
                toast.error(message);
            } finally {
                setPreparationPhase('idle');
            }
        },
        [createProject, isCreating, preparationPhase, options?.currentUser, router]
    );

    useEffect(() => {
        if (enhancedPrompt && enhanceLoading === false) {
            setPromptValue(enhancedPrompt);
        }
    }, [enhancedPrompt, enhanceLoading]);

    // Restore saved prompt on mount if user is authenticated
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedPrompt = localStorage.getItem(SAVED_PROMPT_KEY);
        if (savedPrompt && options?.currentUser) {
            setPromptValue(savedPrompt);
            // Clear the saved prompt after restoring it
            localStorage.removeItem(SAVED_PROMPT_KEY);
            // Also clear the cookie
            document.cookie = `${SAVED_PROMPT_KEY}=; path=/; max-age=0`;
        }
    }, [options?.currentUser]);

    return {
        promptValue,
        setPromptValue,
        enhancedPrompt,
        enhanceLoading,
        handleEnhancePrompt,
        handleSendPrompt,
        creationState,
        isCreating,
        preparationPhase,
        isPreprocessing: preparationPhase !== 'idle',
        showMorphLoading: isCreating && preparationPhase === 'idle',
        isMorphing: isCreating && preparationPhase === 'idle'
    };
}
