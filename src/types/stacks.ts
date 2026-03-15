/**
 * Stack Selector Types
 *
 * Type definitions for stack/framework selector component.
 * These types align with the backend StackConfig interface.
 */

/**
 * Represents a technology stack available for project generation.
 * This is frontend representation of the backend StackConfig.
 */
export interface Stack {
    /** Unique identifier for this stack (e.g., 'python-fastapi') */
    id: string;
    /** Human-readable name (e.g., 'Python FastAPI') */
    name: string;
    /** Programming language (e.g., 'Python') */
    language: string;
    /** Framework name (e.g., 'FastAPI') */
    framework: string;
    /** Brief description of stack */
    description: string;
    /** Key features/benefits of this stack */
    features: string[];
    /** Optional icon or logo URL */
    icon?: string;
    /** Color theme for this stack (for UI purposes) */
    color?: string;
}

/**
 * Response from the stacks API endpoint
 */
export interface StacksResponse {
    /** Array of available stacks */
    stacks: Stack[];
    /** Total count of stacks */
    total: number;
}

/**
 * Error response from the stacks API
 */
export interface StacksError {
    /** Error message */
    message: string;
    /** Error code */
    code?: string;
    /** Additional error details */
    details?: Record<string, unknown>;
}

/**
 * Props for StackSelector component
 */
export interface StackSelectorProps {
    /** Currently selected framework */
    selectedFramework?: string;
    /** Currently selected language */
    selectedLanguage?: string;
    /** Callback invoked when a stack is selected */
    onStackSelect: (framework: string, language: string) => void;
    /** Whether selector is disabled */
    disabled?: boolean;
    /** Optional custom class name */
    className?: string;
    /** Optional error message to display */
    error?: string;
}

/**
 * Props for an individual StackCard component
 */
export interface StackCardProps {
    /** Stack data to display */
    stack: Stack;
    /** Whether this stack is currently selected */
    isSelected: boolean;
    /** Callback invoked when this stack is selected */
    onSelect: (stackId: string) => void;
    /** Whether card is disabled */
    disabled?: boolean;
    /** Optional custom class name */
    className?: string;
}

/**
 * State for stack selector component
 */
export interface StackSelectorState {
    /** List of available stacks */
    stacks: Stack[];
    /** Whether stacks are currently being fetched */
    isLoading: boolean;
    /** Error message if fetching failed */
    error: string | null;
    /** Current search query */
    searchQuery: string;
    /** Filtered list of stacks based on search */
    filteredStacks: Stack[];
}

/**
 * Props for StackSearch component
 */
export interface StackSearchProps {
    /** Current search query value */
    value: string;
    /** Callback invoked when search query changes */
    onChange: (query: string) => void;
    /** Whether search is disabled */
    disabled?: boolean;
    /** Optional placeholder text */
    placeholder?: string;
}

/**
 * Props for StackList component
 */
export interface StackListProps {
    /** List of stacks to display */
    stacks: Stack[];
    /** Currently selected stack ID */
    selectedStackId: string | null;
    /** Callback invoked when a stack is selected */
    onStackSelect: (stackId: string) => void;
    /** Whether list is disabled */
    disabled?: boolean;
    /** Optional error message to display */
    error?: string;
}
