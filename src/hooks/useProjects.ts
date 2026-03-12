import { useState, useEffect, useCallback } from 'react'
import { ipcClient } from '../lib/ipc-client'
import { useAppStore } from '../store'
import type { Project } from '../types'

export function useProjects() {
  const { projects, setProjects, isLoading, setIsLoading, error, setError } = useAppStore()

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await ipcClient.getAllProjects()
      setProjects(data as Project[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setIsLoading(false)
    }
  }, [setProjects, setIsLoading, setError])

  const createProject = async (data: {
    title: string
    description?: string
    genre?: string
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('IPC Client: Creating project...', data)
      const project = await ipcClient.createProject(data)
      console.log('IPC Client: Project created:', project)
      await fetchProjects()
      return project
    } catch (err) {
      console.error('IPC Client: Failed to create project:', err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProject = async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await ipcClient.deleteProject(id)
      await fetchProjects()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    deleteProject,
  }
}

export function useProject(id: number | null) {
  const { currentProject, setCurrentProject, isLoading, setIsLoading, error, setError } =
    useAppStore()

  const fetchProject = useCallback(async () => {
    if (!id) return

    setIsLoading(true)
    setError(null)
    try {
      const project = await ipcClient.getProject(id)
      setCurrentProject(project as Project)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project')
    } finally {
      setIsLoading(false)
    }
  }, [id, setCurrentProject, setIsLoading, setError])

  const updateProject = async (data: Partial<Project>) => {
    if (!id) return

    setIsLoading(true)
    setError(null)
    try {
      const project = await ipcClient.updateProject(id, data)
      setCurrentProject(project as Project)
      return project
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  return {
    project: currentProject,
    isLoading,
    error,
    fetchProject,
    updateProject,
  }
}