'use client'

import { AIProject, aiProjectsService, CreateAIProjectData } from '@/services/api/aiProjects'
import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

export function useAIProject(projectId?: string) {
  const [project, setProject] = useState<AIProject | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Refs to prevent stale closures and multiple calls
  const currentProjectIdRef = useRef(projectId)
  const loadingRef = useRef(false)

  
  useEffect(() => {
    if (projectId) {
      loadProject(projectId)
    }
  }, [projectId])

  
  useEffect(() => {
    if (!project) return

    const unsubscribePatched = aiProjectsService.onPatched((updatedProject) => {
      if (updatedProject._id === project._id) {
        setProject(updatedProject)
        
        if (updatedProject.status === 'ready' && project.status === 'generating') {
          toast.success('Project generated successfully!')
        } else if (updatedProject.status === 'error' && project.status === 'generating') {
          toast.error('Project generation failed')
        }
      }
    })

    const unsubscribeUpdated = aiProjectsService.onUpdated((updatedProject) => {
      if (updatedProject._id === project._id) {
        setProject(updatedProject)
      }
    })

    return () => {
      unsubscribePatched()
      unsubscribeUpdated()
    }
  }, [project])

  const loadProject = useCallback(async (id: string) => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current || !id) return
    
    try {
      loadingRef.current = true
      setLoading(true)
      setError(null)
      
      const loadedProject = await aiProjectsService.get(id)
      
      // Only update if we're still on the same project
      if (currentProjectIdRef.current === id) {
        setProject(loadedProject)
      }
    } catch (err) {
      // Only show error if we're still on the same project
      if (currentProjectIdRef.current === id) {
        console.error('Failed to load project:', err)
        setError('Failed to load project')
        toast.error('Failed to load project')
      }
    } finally {
      loadingRef.current = false
      if (currentProjectIdRef.current === id) {
        setLoading(false)
      }
    }
  }, [])

  const createProject = useCallback(async (data: CreateAIProjectData): Promise<AIProject | null> => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current) return null
    
    try {
      loadingRef.current = true
      setLoading(true)
      setError(null)
      
      const newProject = await aiProjectsService.create(data)
      setProject(newProject)
      currentProjectIdRef.current = newProject._id
      toast.success('Project creation started!')
      return newProject
    } catch (err) {
      console.error('Failed to create project:', err)
      setError('Failed to create project')
      toast.error('Failed to create project')
      return null
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  const updateProject = async (id: string, data: Partial<AIProject>): Promise<AIProject | null> => {
    try {
      setLoading(true)
      setError(null)
      const updatedProject = await aiProjectsService.patch(id, data)
      setProject(updatedProject)
      return updatedProject
    } catch (err) {
      console.error('Failed to update project:', err)
      setError('Failed to update project')
      toast.error('Failed to update project')
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await aiProjectsService.remove(id)
      setProject(null)
      toast.success('Project deleted successfully')
      return true
    } catch (err) {
      console.error('Failed to delete project:', err)
      setError('Failed to delete project')
      toast.error('Failed to delete project')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    project,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    loadProject
  }
}