'use client';

import { fetchStacks } from '@/api/stacks/fetchStacks';
import Header from '@/components/custom/Header';
import ProjectPreparationOverlay from '@/components/custom/ProjectPreparationOverlay';
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';
import { useInitialScreen } from '@/hooks/useInitialScreen';
import { useRouter } from 'next/navigation';
import { UserData } from '../auth/types';

interface InitialScreenProps {
    currentUser: UserData | undefined;
}

export function InitialScreen({ currentUser }: InitialScreenProps) {
    const router = useRouter();
    const {
        promptValue,
        setPromptValue,
        enhancedPrompt,
        enhanceLoading,
        handleEnhancePrompt,
        handleSendPrompt,
        creationState,
        isPreprocessing,
        showMorphLoading,
        isMorphing,
        selectedStackId,
        setSelectedStackId,
        selectedFramework,
        selectedLanguage
    } = useInitialScreen({ currentUser });

    const handleSendWithAuth = (prompt: string) => {
        if (!currentUser) {
            router.push('/auth');
            return;
        }
        handleSendPrompt(prompt);
    };

    return (
        <div className="relative">
            <Header currentUser={currentUser ?? null} currentPage="initial" onNavigateClick={() => router.push('/dashboard')} />
            <div className="h-[calc(100vh-80px)]">
                {/* Chat Interface with integrated Stack Selector */}
                <AnimatedAIChat
                    enhancedPrompt={enhancedPrompt}
                    value={promptValue}
                    setValue={setPromptValue}
                    onSendClick={handleSendWithAuth}
                    onEnhanceClick={handleEnhancePrompt}
                    enhanceLoading={enhanceLoading}
                    sending={isPreprocessing}
                    isMorphing={isMorphing}
                    className="h-full"
                    selectedFramework={selectedFramework}
                    selectedLanguage={selectedLanguage}
                    onStackSelect={(framework, language) => {
                        // Find the stack with matching framework and language and set its ID
                        // This maintains backward compatibility while using the new framework/language approach
                        fetchStacks()
                            .then((stacks) => {
                                const matchingStack = stacks.find((s) => s.framework === framework && s.language === language);
                                if (matchingStack) {
                                    setSelectedStackId(matchingStack.id);
                                }
                            })
                            .catch((err) => {
                                console.error('Failed to fetch stacks:', err);
                            });
                    }}
                    stackSelectorDisabled={isPreprocessing}
                />
            </div>
            <ProjectPreparationOverlay visible={showMorphLoading} state={creationState} />
        </div>
    );
}
