import { useState, useEffect } from 'react'
import { ipcClient } from '../lib/ipc-client'
import type { AIConfig } from '../types'

export function useAIConfigs() {
  const [configs, setConfigs] = useState<AIConfig[]>([])
  const [defaultConfig, setDefaultConfig] = useState<AIConfig | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const data = await ipcClient.getAllAIConfigs()
      setConfigs(data as AIConfig[])
      const defaultCfg = (data as AIConfig[]).find(c => c.is_default)
      setDefaultConfig(defaultCfg || null)
    } catch (error) {
      console.error('Failed to fetch AI configs:', error)
      setConfigs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  const createConfig = async (data: {
    name: string
    provider: 'openai' | 'anthropic'
    api_key: string
    model: string
    temperature?: number
    max_tokens?: number
    is_default?: boolean
  }) => {
    const config = await ipcClient.createAIConfig(data)
    await fetchConfigs()
    return config
  }

  const updateConfig = async (id: number, data: Partial<AIConfig>) => {
    const config = await ipcClient.updateAIConfig(id, data)
    await fetchConfigs()
    return config
  }

  const deleteConfig = async (id: number) => {
    await ipcClient.deleteAIConfig(id)
    await fetchConfigs()
  }

  const setDefault = async (id: number) => {
    await ipcClient.setDefaultAIConfig(id)
    await fetchConfigs()
  }

  return {
    configs,
    defaultConfig,
    loading,
    createConfig,
    updateConfig,
    deleteConfig,
    setDefault,
    refreshConfigs: fetchConfigs,
  }
}