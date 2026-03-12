import { useState, useEffect } from 'react'
import { ipcClient } from '../lib/ipc-client'
import type { Scene } from '../types/scene'

export function useScenes(projectId: number | null) {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchScenes = async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)
    try {
      const data = await ipcClient.getScenesByProject(projectId)
      setScenes(data as Scene[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scenes')
    } finally {
      setLoading(false)
    }
  }

  const createScene = async (data: {
    project_id: number
    name: string
    location?: string
    atmosphere?: string
    description?: string
    notes?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const scene = await ipcClient.createScene(data)
      await fetchScenes()
      return scene
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scene')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateScene = async (id: number, data: Partial<Scene>) => {
    setLoading(true)
    setError(null)
    try {
      const scene = await ipcClient.updateScene(id, data)
      await fetchScenes()
      return scene
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update scene')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteScene = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await ipcClient.deleteScene(id)
      await fetchScenes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete scene')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScenes()
  }, [projectId])

  return {
    scenes,
    loading,
    error,
    fetchScenes,
    createScene,
    updateScene,
    deleteScene,
  }
}