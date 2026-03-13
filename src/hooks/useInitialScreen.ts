'use client';

import { enhancePrompt } from '@/api/enhancePrompt/enhancePrompt';
import { inferProjectMeta } from '@/api/inferProjectMeta/inferProjectMeta';
import { defaultAiModel } from '@/config/environment';
import { useProjectCreation } from '@/hooks/useProjectCreation';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UseInitialScreenOptions {
    onProjectCreated?: (projectId: string) => void;
}

type PreparationPhase = 'idle' | 'enhancing' | 'inferring-meta';

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
        [createProject, isCreating, preparationPhase]
    );

    useEffect(() => {
        if (enhancedPrompt && enhanceLoading === false) {
            setPromptValue(enhancedPrompt);
        }
    }, [enhancedPrompt, enhanceLoading]);

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
