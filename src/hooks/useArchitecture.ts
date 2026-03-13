'use client';

import { fetchArchitecture } from '@/api/architecture/fetchArchitecture';
import type { Architecture } from '@/types/feathers';
import { useCallback, useState } from 'react';

export function useArchitecture() {
    const [architecture, setArchitecture] = useState<Architecture | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadArchitecture = useCallback(async (projectId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchArchitecture(projectId);
            setArchitecture(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load architecture');
        } finally {
            setLoading(false);
        }
    }, []);

    return { architecture, loading, error, loadArchitecture };
}
