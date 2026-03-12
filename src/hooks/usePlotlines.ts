import { useState, useEffect } from 'react'
import { ipcClient } from '../lib/ipc-client'
import type { Plotline } from '../types'

export function usePlotlines(projectId: number | null) {
  const [plotlines, setPlotlines] = useState<Plotline[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPlotlines = async () => {
    if (!projectId) {
      setPlotlines([])
      return
    }

    setLoading(true)
    try {
      const data = await ipcClient.getPlotlinesByProject(projectId)
      setPlotlines(data as Plotline[])
    } catch (error) {
      console.error('Failed to fetch plotlines:', error)
      setPlotlines([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlotlines()
  }, [projectId])

  const createPlotline = async (data: {
    title: string
    type?: 'main' | 'sub'
    start_chapter_id?: number
    end_chapter_id?: number
    status?: 'planning' | 'writing' | 'completed'
    description?: string
    notes?: string
  }) => {
    if (!projectId) throw new Error('Project ID is required')
    const plotline = await ipcClient.createPlotline({
      project_id: projectId,
      ...data,
    })
    await fetchPlotlines()
    return plotline
  }

  const updatePlotline = async (id: number, data: Partial<Plotline>) => {
    const plotline = await ipcClient.updatePlotline(id, data)
    await fetchPlotlines()
    return plotline
  }

  const deletePlotline = async (id: number) => {
    await ipcClient.deletePlotline(id)
    await fetchPlotlines()
  }

  return {
    plotlines,
    loading,
    createPlotline,
    updatePlotline,
    deletePlotline,
    refreshPlotlines: fetchPlotlines,
  }
}