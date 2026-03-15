'use client';

import { StackSelector } from '@/components/custom/StackSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreateProjectData } from '@/types/feathers';

/**
 * Props for ProjectCreationForm component.
 * Fully stateless - all data and handlers passed as props.
 */
export interface ProjectCreationFormProps {
    /** Current form values */
    values: {
        name: string;
        description: string;
        framework: string;
        language: string;
    };
    /** Whether the form is currently submitting */
    isSubmitting: boolean;
    /** Callback invoked when form values change */
    onChange: (values: ProjectCreationFormProps['values']) => void;
    /** Callback invoked when form is submitted */
    onSubmit: (data: CreateProjectData) => void;
    /** Callback invoked when user cancels */
    onCancel?: () => void;
}

/**
 * Stateless Project Creation Form Component.
 *
 * This component provides a simple form for creating new projects with:
 * - Project name input
 * - Project description textarea
 * - Stack/framework selection using StackSelector component
 *
 * @example
 * ```tsx
 * <ProjectCreationForm
 *   values={formValues}
 *   isSubmitting={isCreating}
 *   onChange={setFormValues}
 *   onSubmit={handleCreateProject}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export function ProjectCreationForm({ values, isSubmitting, onChange, onSubmit, onCancel }: ProjectCreationFormProps) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({
            name: values.name,
            description: values.description,
            framework: values.framework as CreateProjectData['framework'],
            language: values.language as CreateProjectData['language']
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="My Awesome Project"
                    value={values.name}
                    onChange={(e) => onChange({ ...values, name: e.target.value })}
                    disabled={isSubmitting}
                    required
                    className="w-full"
                />
            </div>

            {/* Project Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Describe your project (e.g., A REST API for task management with user authentication)"
                    value={values.description}
                    onChange={(e) => onChange({ ...values, description: e.target.value })}
                    disabled={isSubmitting}
                    required
                    rows={4}
                    className="w-full resize-none"
                />
            </div>

            {/* Stack Selection */}
            <StackSelector
                selectedFramework={values.framework}
                selectedLanguage={values.language}
                onStackSelect={(framework, language) => onChange({ ...values, framework, language })}
                disabled={isSubmitting}
            />

            {/* Action Buttons */}
            <div className="flex gap-3">
                {/* Cancel Button */}
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
                        Cancel
                    </Button>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isSubmitting || !values.name.trim() || !values.description.trim() || !values.framework || !values.language}
                    className="flex-1"
                >
                    {isSubmitting ? 'Creating...' : 'Create Project'}
                </Button>
            </div>
        </form>
    );
}
