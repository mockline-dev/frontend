'use client';

import { fetchStacks } from '@/api/stacks/fetchStacks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Stack, StackSelectorProps } from '@/types/stacks';
import { AlertCircle, Check, Loader2, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

/**
 * Stack Selector Component
 *
 * A refined, industrial-styled component for selecting technology stacks.
 * Features search/filter, keyboard navigation, and smooth animations.
 *
 * Design Philosophy: Refined Industrial
 * - Clean, purposeful layout with technical precision
 * - Generous spacing and clear visual hierarchy
 * - Subtle animations that enhance, not distract
 * - High contrast for readability
 *
 * @param selectedStackId - Currently selected stack ID
 * @param onStackSelect - Callback when a stack is selected
 * @param disabled - Whether selector is disabled
 * @param className - Optional custom class name
 * @param error - Optional error message to display
 */
export function StackSelector({
    selectedFramework,
    selectedLanguage,
    onStackSelect,
    disabled = false,
    className,
    error,
    compact = false
}: StackSelectorProps & { compact?: boolean }) {
    // Component state
    const [stacks, setStacks] = useState<Stack[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch stacks on mount
    useEffect(() => {
        const loadStacks = async () => {
            try {
                const fetchedStacks = await fetchStacks();
                setStacks(fetchedStacks);
                setIsLoading(false);
                setLoadError(null);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load stacks';
                setLoadError(errorMessage);
                setIsLoading(false);
            }
        };

        loadStacks();
    }, []);

    // Filter stacks based on search query using useMemo for performance
    const filteredStacks = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        if (!query) {
            return stacks;
        }

        return stacks.filter(
            (stack) =>
                stack.name.toLowerCase().includes(query) ||
                stack.language.toLowerCase().includes(query) ||
                stack.framework.toLowerCase().includes(query) ||
                stack.description.toLowerCase().includes(query) ||
                stack.features.some((feature) => feature.toLowerCase().includes(query))
        );
    }, [searchQuery, stacks]);

    const selectedValue = useMemo(() => {
        if (!selectedFramework || !selectedLanguage) return undefined;
        const selectedStack = stacks.find((stack) => stack.framework === selectedFramework && stack.language === selectedLanguage);
        return selectedStack?.id;
    }, [selectedFramework, selectedLanguage, stacks]);

    if (compact) {
        const compactDisabled = disabled || isLoading || !!loadError || !!error || stacks.length === 0;
        const compactPlaceholder = isLoading ? 'Loading stacks…' : loadError || error ? 'Stacks unavailable' : 'Select stack';

        return (
            <div className={cn('w-full', className)}>
                <Select
                    {...(selectedValue ? { value: selectedValue } : {})}
                    onValueChange={(stackId) => {
                        const stack = stacks.find((s) => s.id === stackId);
                        if (stack && !disabled) {
                            onStackSelect(stack.framework, stack.language);
                        }
                    }}
                    disabled={compactDisabled}
                >
                    <SelectTrigger className="w-full h-10 bg-black/5 border-black/10 text-black/80 focus-visible:ring-black/20" aria-label="Select technology stack">
                        <SelectValue placeholder={compactPlaceholder} />
                    </SelectTrigger>
                    <SelectContent align="start" className="max-h-80">
                        {stacks.map((stack) => (
                            <SelectItem key={stack.id} value={stack.id}>
                                <div className="flex min-w-0 flex-col">
                                    <span className="truncate font-medium">{stack.name}</span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {stack.language} • {stack.framework}
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {(loadError || error) && <p className="mt-1 text-xs text-destructive/80 truncate">{loadError || error}</p>}
            </div>
        );
    }

    // Handle stack selection
    const handleStackSelect = (stackId: string) => {
        if (!disabled) {
            const stack = stacks.find((s) => s.id === stackId);
            if (stack) {
                onStackSelect(stack.framework, stack.language);
            }
        }
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className={cn('space-y-4', className)}>
                <Label className="text-sm font-semibold text-foreground">Select Technology Stack</Label>
                <div className="flex items-center justify-center py-12 border border-border rounded-lg bg-card">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    // Render error state
    if (loadError || error) {
        return (
            <div className={cn('space-y-4', className)}>
                <Label className="text-sm font-semibold text-foreground">Select Technology Stack</Label>
                <div className="flex items-center gap-3 p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm text-destructive font-medium">{loadError || error}</p>
                        <p className="text-xs text-destructive/70 mt-1">Please try refreshing the page</p>
                    </div>
                </div>
            </div>
        );
    }

    // Render empty state when no stacks match search
    if (filteredStacks.length === 0) {
        return (
            <div className={cn('space-y-4', className)}>
                <Label className="text-sm font-semibold text-foreground">Select Technology Stack</Label>
                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search stacks by name, language, or framework..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={disabled}
                            className="pl-10"
                        />
                    </div>

                    {/* Empty State */}
                    <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-lg bg-muted/30">
                        <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <p className="text-sm text-muted-foreground font-medium">No stacks found matching &ldquo;{searchQuery}&rdquo;</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
                    </div>
                </div>
            </div>
        );
    }

    // Render main component
    return (
        <div className={cn('space-y-4', className)}>
            <Label className="text-sm font-semibold text-foreground">
                Select Technology Stack
                <span className="text-destructive ml-1">*</span>
            </Label>

            <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search stacks by name, language, or framework..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={disabled}
                        className="pl-10"
                    />
                </div>

                {/* Stack Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredStacks.map((stack, index) => (
                        <StackCard
                            key={stack.id}
                            stack={stack}
                            isSelected={selectedFramework === stack.framework && selectedLanguage === stack.language}
                            onSelect={handleStackSelect}
                            disabled={disabled}
                            style={{ animationDelay: `${index * 50}ms` }}
                        />
                    ))}
                </div>

                {/* Stack Count */}
                <p className="text-xs text-muted-foreground text-center">
                    Showing {filteredStacks.length} of {stacks.length} stacks
                </p>
            </div>
        </div>
    );
}

/**
 * Stack Card Component
 *
 * Individual stack card with refined industrial design.
 * Features smooth hover animations and clear selection state.
 */
interface StackCardProps {
    stack: Stack;
    isSelected: boolean;
    onSelect: (stackId: string) => void;
    disabled?: boolean;
    style?: React.CSSProperties;
}

function StackCard({ stack, isSelected, onSelect, disabled, style }: StackCardProps) {
    // Determine if this card is selected based on framework and language
    const isCardSelected = isSelected;
    return (
        <button
            type="button"
            onClick={() => onSelect(stack.id)}
            disabled={disabled}
            style={style}
            className={cn(
                'group relative w-full text-left p-5 rounded-lg border-2 transition-all duration-200',
                'hover:shadow-lg hover:-translate-y-0.5',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'animate-element',
                // Selected state
                isSelected ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card hover:border-primary/50',
                // Disabled state
                disabled && 'opacity-50 cursor-not-allowed hover:shadow-none hover:translate-y-0'
            )}
            aria-pressed={isCardSelected}
            aria-label={`Select ${stack.name} stack`}
        >
            {/* Selection Indicator */}
            {isCardSelected && (
                <div className="absolute top-4 right-4">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                        <Check className="w-4 h-4" />
                    </div>
                </div>
            )}

            {/* Stack Header */}
            <div className="mb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <h3 className={cn('font-bold text-base leading-tight', isCardSelected ? 'text-primary' : 'text-foreground')}>{stack.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                            {stack.language} • {stack.framework}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stack Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{stack.description}</p>

            {/* Stack Features */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Key Features</p>
                <ul className="space-y-1">
                    {stack.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <span className="line-clamp-1">{feature}</span>
                        </li>
                    ))}
                    {stack.features.length > 3 && <li className="text-xs text-muted-foreground/70 italic">+{stack.features.length - 3} more features</li>}
                </ul>
            </div>

            {/* Hover Effect Overlay */}
            <div
                className={cn(
                    'absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-200',
                    'group-hover:opacity-100 pointer-events-none'
                )}
            />
        </button>
    );
}
