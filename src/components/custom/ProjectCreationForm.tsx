'use client';

import { StackSelector } from '@/components/custom/StackSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreateProjectData } from '@/types/feathers';
import type { Project } from '@/types/feathers';

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
    /** Validation errors */
    errors?: {
        name?: string;
        description?: string;
        framework?: string;
        language?: string;
    };
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
 *   errors={validationErrors}
 *   onChange={setFormValues}
 *   onSubmit={handleCreateProject}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export function ProjectCreationForm({
    values,
    isSubmitting,
    errors,
    onChange,
    onSubmit,
    onCancel
}: ProjectCreationFormProps) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validFrameworks: Project['framework'][] = [
            'fast-api',
            'feathers',
            'express',
            'go-gin',
            'spring-boot',
            'actix',
            'nestjs'
        ];

        const validLanguages: Project['language'][] = [
            'python',
            'typescript',
            'go',
            'java',
            'rust'
        ];

        const framework = values.framework as Project['framework'];
        const language = values.language as Project['language'];

        if (!validFrameworks.includes(framework)) {
            throw new Error(`Invalid framework: ${framework}`);
        }

        if (!validLanguages.includes(language)) {
            throw new Error(`Invalid language: ${language}`);
        }

        onSubmit({
            name: values.name,
            description: values.description,
            framework,
            language
        });
    };

    const isFormValid =
        values.name.trim().length > 0 &&
        values.description.trim().length >= 10 &&
        values.framework &&
        values.language;

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
                    aria-invalid={!!errors?.name}
                    aria-describedby={errors?.name ? 'name-error' : undefined}
                />
                {errors?.name && (
                    <p id="name-error" className="text-sm text-red-500">
                        {errors.name}
                    </p>
                )}
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
                    aria-invalid={!!errors?.description}
                    aria-describedby={errors?.description ? 'description-error' : undefined}
                />
                {errors?.description && (
                    <p id="description-error" className="text-sm text-red-500">
                        {errors.description}
                    </p>
                )}
            </div>

            {/* Stack Selection */}
            <StackSelector
                selectedFramework={values.framework}
                selectedLanguage={values.language}
                onStackSelect={(framework, language) => onChange({ ...values, framework, language })}
                disabled={isSubmitting}
            />
            {errors?.framework && (
                <p className="text-sm text-red-500">{errors.framework}</p>
            )}
            {errors?.language && (
                <p className="text-sm text-red-500">{errors.language}</p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                {/* Cancel Button */}
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className="flex-1"
                >
                    {isSubmitting ? 'Creating...' : 'Create Project'}
                </Button>
            </div>
        </form>
    );
}
