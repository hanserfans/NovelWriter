import { useState, useEffect } from 'react'
import { ipcClient } from '../lib/ipc-client'
import type { Character } from '../../types'

export function useCharacters(projectId: number | null) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCharacters = async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)
    try {
      const data = await ipcClient.getCharactersByProject(projectId)
      setCharacters(data as Character[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch characters')
    } finally {
      setLoading(false)
    }
  }

  const createCharacter = async (data: {
    project_id: number
    name: string
    avatar?: string
    gender?: string
    age?: number
    appearance?: string
    personality?: string
    background?: string
    abilities?: string
    relationships?: string
    notes?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      console.log('Creating character:', data)
      const character = await ipcClient.createCharacter(data)
      console.log('Character created:', character)
      await fetchCharacters()
      return character
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateCharacter = async (id: number, data: Partial<Character>) => {
    setLoading(true)
    setError(null)
    try {
      const character = await ipcClient.updateCharacter(id, data)
      await fetchCharacters()
      return character
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update character')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteCharacter = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await ipcClient.deleteCharacter(id)
      await fetchCharacters()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete character')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCharacters()
  }, [projectId])

  return {
    characters,
    loading,
    error,
    fetchCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
  }
}