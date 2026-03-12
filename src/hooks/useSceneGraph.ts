import { useState, useEffect } from 'react'
import { ipcClient } from '../lib/ipc-client'
import type { Scene, SceneRelationship, ScenePosition } from '../types/scene'

export function useSceneGraph(projectId: number | null) {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [relationships, setRelationships] = useState<SceneRelationship[]>([])
  const [positions, setPositions] = useState<ScenePosition[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    if (!projectId) {
      setScenes([])
      setRelationships([])
      setPositions([])
      return
    }

    setLoading(true)
    try {
      const [scenesData, relationshipsData, positionsData] = await Promise.all([
        ipcClient.getScenesByProject(projectId),
        ipcClient.getSceneRelationshipsByProject(projectId),
        ipcClient.getScenePositionsByProject(projectId),
      ])
      setScenes(scenesData as Scene[])
      setRelationships(relationshipsData as SceneRelationship[])
      setPositions(positionsData as ScenePosition[])
    } catch (error) {
      console.error('Failed to fetch scene graph data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [projectId])

  const createRelationship = async (data: {
    scene1_id: number
    scene2_id: number
    relationship_type: string
    description?: string
  }) => {
    if (!projectId) throw new Error('Project ID is required')
    const relationship = await ipcClient.createSceneRelationship({
      project_id: projectId,
      ...data,
    })
    await fetchData()
    return relationship
  }

  const deleteRelationship = async (id: number) => {
    await ipcClient.deleteSceneRelationship(id)
    await fetchData()
  }

  const savePosition = async (sceneId: number, x: number, y: number) => {
    if (!projectId) throw new Error('Project ID is required')
    const position = await ipcClient.saveScenePosition({
      scene_id: sceneId,
      project_id: projectId,
      x,
      y,
    })
    await fetchData()
    return position
  }

  const getScenePosition = (sceneId: number) => {
    return positions.find((p) => p.scene_id === sceneId)
  }

  return {
    scenes,
    relationships,
    positions,
    loading,
    createRelationship,
    deleteRelationship,
    savePosition,
    getScenePosition,
    refreshData: fetchData,
  }
}