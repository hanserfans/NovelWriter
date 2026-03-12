import { create } from 'zustand'
import type { Project, Chapter } from '../types'

interface AppState {
  // Current project
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void

  // Projects list
  projects: Project[]
  setProjects: (projects: Project[]) => void

  // Current chapter
  currentChapter: Chapter | null
  setCurrentChapter: (chapter: Chapter | null) => void

  // Chapters list
  chapters: Chapter[]
  setChapters: (chapters: Chapter[]) => void

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Error state
  error: string | null
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),

  projects: [],
  setProjects: (projects) => set({ projects }),

  currentChapter: null,
  setCurrentChapter: (chapter) => set({ currentChapter: chapter }),

  chapters: [],
  setChapters: (chapters) => set({ chapters }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error }),
}))