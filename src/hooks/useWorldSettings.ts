import { useState, useEffect } from 'react'
import { ipcClient } from '../lib/ipc-client'
import type { WorldSetting } from '../types'

export function useWorldSettings(projectId: number | null) {
  const [worldSettings, setWorldSettings] = useState<WorldSetting[]>([])
  const [loading, setLoading] = useState(false)

  const fetchWorldSettings = async () => {
    if (!projectId) {
      setWorldSettings([])
      return
    }

    setLoading(true)
    try {
      const data = await ipcClient.getWorldSettingsByProject(projectId)
      setWorldSettings(data as WorldSetting[])
    } catch (error) {
      console.error('Failed to fetch world settings:', error)
      setWorldSettings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorldSettings()
  }, [projectId])

  const createWorldSetting = async (data: {
    category: string
    title: string
    content?: string
  }) => {
    if (!projectId) throw new Error('Project ID is required')
    const setting = await ipcClient.createWorldSetting({
      project_id: projectId,
      ...data,
    })
    await fetchWorldSettings()
    return setting
  }

  const updateWorldSetting = async (id: number, data: Partial<WorldSetting>) => {
    const setting = await ipcClient.updateWorldSetting(id, data)
    await fetchWorldSettings()
    return setting
  }

  const deleteWorldSetting = async (id: number) => {
    await ipcClient.deleteWorldSetting(id)
    await fetchWorldSettings()
  }

  const getCategories = () => {
    const categories = new Set(worldSettings.map((s) => s.category))
    return Array.from(categories).sort()
  }

  const getByCategory = (category: string) => {
    return worldSettings.filter((s) => s.category === category)
  }

  return {
    worldSettings,
    loading,
    createWorldSetting,
    updateWorldSetting,
    deleteWorldSetting,
    getCategories,
    getByCategory,
    refreshWorldSettings: fetchWorldSettings,
  }
}