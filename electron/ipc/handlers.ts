import { ipcMain } from 'electron'
import { getDatabase } from '../database'
import { ProjectRepository, ChapterRepository, CharacterRepository, CharacterRelationshipRepository, CharacterPositionRepository, SceneRepository, SceneRelationshipRepository, ScenePositionRepository, PlotlineRepository, WorldSettingRepository, TimelineEventRepository, TimelineTrackRepository, AIConfigRepository, AIReviewRepository } from '../database/repositories'
import { AIService } from '../services/ai.service'
import { IPC_CHANNELS } from './channels'
import type { IpcMainInvokeEvent } from 'electron'

// Repository instances
let projectRepo: ProjectRepository
let chapterRepo: ChapterRepository
let characterRepo: CharacterRepository
let relationshipRepo: CharacterRelationshipRepository
let positionRepo: CharacterPositionRepository
let sceneRepo: SceneRepository
let sceneRelationshipRepo: SceneRelationshipRepository
let scenePositionRepo: ScenePositionRepository
let plotlineRepo: PlotlineRepository
let worldSettingRepo: WorldSettingRepository
let timelineEventRepo: TimelineEventRepository
let timelineTrackRepo: TimelineTrackRepository
let aiConfigRepo: AIConfigRepository
let aiReviewRepo: AIReviewRepository

export function initializeRepositories(): void {
  const db = getDatabase()
  projectRepo = new ProjectRepository(db)
  chapterRepo = new ChapterRepository(db)
  characterRepo = new CharacterRepository(db)
  relationshipRepo = new CharacterRelationshipRepository(db)
  positionRepo = new CharacterPositionRepository(db)
  sceneRepo = new SceneRepository(db)
  sceneRelationshipRepo = new SceneRelationshipRepository(db)
  scenePositionRepo = new ScenePositionRepository(db)
  plotlineRepo = new PlotlineRepository(db)
  worldSettingRepo = new WorldSettingRepository(db)
  timelineEventRepo = new TimelineEventRepository(db)
  timelineTrackRepo = new TimelineTrackRepository(db)
  aiConfigRepo = new AIConfigRepository(db)
  aiReviewRepo = new AIReviewRepository(db)
}

// Type for IPC handler
type IpcHandler<T = any, R = any> = (event: IpcMainInvokeEvent, ...args: T[]) => Promise<R> | R

// Register all IPC handlers
export function registerIpcHandlers(): void {
  initializeRepositories()

  // Project handlers
  ipcMain.handle(IPC_CHANNELS.PROJECT_CREATE, (async (_event, data) => {
    try {
      console.log('IPC: Creating project with data:', data)
      const project = projectRepo.create(data)
      console.log('IPC: Project created:', project)
      return project
    } catch (error) {
      console.error('IPC: Failed to create project:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.PROJECT_GET, (async (_event, id: number) => {
    return projectRepo.findById(id)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.PROJECT_GET_ALL, async () => {
    return projectRepo.findAll()
  })

  ipcMain.handle(IPC_CHANNELS.PROJECT_UPDATE, (async (_event, id: number, data) => {
    return projectRepo.updateProject(id, data)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.PROJECT_DELETE, (async (_event, id: number) => {
    projectRepo.delete(id)
    return { success: true }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.PROJECT_SEARCH, (async (_event, keyword: string) => {
    return projectRepo.search(keyword)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.PROJECT_GET_STATS, (async (_event, id: number) => {
    return projectRepo.getStatistics(id)
  }) as IpcHandler)

  // Chapter handlers
  ipcMain.handle(IPC_CHANNELS.CHAPTER_CREATE, (async (_event, data) => {
    const chapter = chapterRepo.create(data)
    // Update project chapter count
    if (chapter) {
      projectRepo.updateChapterCount(chapter.project_id)
    }
    return chapter
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.CHAPTER_GET, (async (_event, id: number) => {
    return chapterRepo.findById(id)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.CHAPTER_GET_BY_PROJECT, (async (_event, projectId: number) => {
    return chapterRepo.findByProject(projectId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.CHAPTER_GET_BY_VOLUME, (async (_event, volumeId: number) => {
    return chapterRepo.findByVolume(volumeId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.CHAPTER_UPDATE, (async (_event, id: number, data) => {
    return chapterRepo.updateChapter(id, data)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.CHAPTER_DELETE, (async (_event, id: number) => {
    const chapter = chapterRepo.findById(id)
    if (chapter) {
      chapterRepo.delete(id)
      // Update project chapter count
      projectRepo.updateChapterCount(chapter.project_id)
    }
    return { success: true }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.CHAPTER_UPDATE_ORDER, (async (
    _event,
    id: number,
    orderIndex: number
  ) => {
    chapterRepo.updateOrder(id, orderIndex)
    return { success: true }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.CHAPTER_MOVE, (async (
    _event,
    id: number,
    newVolumeId: number | null,
    newOrderIndex: number
  ) => {
    chapterRepo.moveChapter(id, newVolumeId, newOrderIndex)
    return { success: true }
  }) as IpcHandler)

  // Character handlers
  ipcMain.handle(IPC_CHANNELS.CHARACTER_CREATE, (async (_event, data) => {
    try {
      console.log('IPC: Creating character with data:', data)
      const character = characterRepo.create(data)
      console.log('IPC: Character created:', character)
      return character
    } catch (error) {
      console.error('IPC: Failed to create character:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.CHARACTER_GET, (async (_event, id: number) => {
    return characterRepo.findById(id)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.CHARACTER_GET_BY_PROJECT, (async (_event, projectId: number) => {
    return characterRepo.findByProject(projectId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.CHARACTER_UPDATE, (async (_event, id: number, data) => {
    return characterRepo.updateCharacter(id, data)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.CHARACTER_DELETE, (async (_event, id: number) => {
    characterRepo.delete(id)
    // Also delete relationships involving this character
    relationshipRepo.deleteByCharacter(id)
    return { success: true }
  }) as IpcHandler)

  // Relationship handlers
  ipcMain.handle(IPC_CHANNELS.RELATIONSHIP_CREATE, (async (_event, data) => {
    try {
      console.log('IPC: Creating relationship:', data)
      const relationship = relationshipRepo.create(data)
      console.log('IPC: Relationship created:', relationship)
      return relationship
    } catch (error) {
      console.error('IPC: Failed to create relationship:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.RELATIONSHIP_GET, (async (_event, id: number) => {
    return relationshipRepo.findById(id)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.RELATIONSHIP_GET_BY_PROJECT, (async (_event, projectId: number) => {
    return relationshipRepo.findByProject(projectId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.RELATIONSHIP_GET_BY_CHARACTER, (async (_event, characterId: number) => {
    return relationshipRepo.findByCharacter(characterId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.RELATIONSHIP_UPDATE, (async (_event, id: number, data) => {
    return relationshipRepo.updateRelationship(id, data)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.RELATIONSHIP_DELETE, (async (_event, id: number) => {
    relationshipRepo.delete(id)
    return { success: true }
  }) as IpcHandler)

  // Position handlers
  ipcMain.handle(IPC_CHANNELS.POSITION_SAVE, (async (_event, data: {
    character_id: number
    project_id: number
    x: number
    y: number
  }) => {
    try {
      const position = positionRepo.upsert(data)
      return position
    } catch (error) {
      console.error('Failed to save position:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.POSITION_GET_BY_PROJECT, (async (_event, projectId: number) => {
    return positionRepo.findByProject(projectId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.POSITION_GET_BY_CHARACTER, (async (_event, characterId: number) => {
    return positionRepo.findByCharacter(characterId)
  }) as IpcHandler)

  // Scene handlers
  ipcMain.handle(IPC_CHANNELS.SCENE_CREATE, (async (_event, data) => {
    try {
      console.log('IPC: Creating scene:', data)
      const scene = sceneRepo.create(data)
      console.log('IPC: Scene created:', scene)
      return scene
    } catch (error) {
      console.error('IPC: Failed to create scene:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.SCENE_GET, (async (_event, id: number) => {
    return sceneRepo.findById(id)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.SCENE_GET_BY_PROJECT, (async (_event, projectId: number) => {
    return sceneRepo.findByProject(projectId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.SCENE_UPDATE, (async (_event, id: number, data) => {
    return sceneRepo.updateScene(id, data)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.SCENE_DELETE, (async (_event, id: number) => {
    sceneRepo.delete(id)
    // Also delete relationships and positions involving this scene
    sceneRelationshipRepo.deleteByScene(id)
    scenePositionRepo.deleteByScene(id)
    return { success: true }
  }) as IpcHandler)

  // Scene Relationship handlers
  ipcMain.handle(IPC_CHANNELS.SCENE_RELATIONSHIP_CREATE, (async (_event, data) => {
    try {
      console.log('IPC: Creating scene relationship:', data)
      const relationship = sceneRelationshipRepo.create(data)
      console.log('IPC: Scene relationship created:', relationship)
      return relationship
    } catch (error) {
      console.error('IPC: Failed to create scene relationship:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.SCENE_RELATIONSHIP_GET, (async (_event, id: number) => {
    return sceneRelationshipRepo.getById(id)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.SCENE_RELATIONSHIP_GET_BY_PROJECT, (async (_event, projectId: number) => {
    return sceneRelationshipRepo.findByProject(projectId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.SCENE_RELATIONSHIP_GET_BY_SCENE, (async (_event, sceneId: number) => {
    return sceneRelationshipRepo.findByScene(sceneId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.SCENE_RELATIONSHIP_UPDATE, (async (_event, id: number, data) => {
    return sceneRelationshipRepo.update(id, data)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.SCENE_RELATIONSHIP_DELETE, (async (_event, id: number) => {
    sceneRelationshipRepo.delete(id)
    return { success: true }
  }) as IpcHandler)

  // Scene Position handlers
  ipcMain.handle(IPC_CHANNELS.SCENE_POSITION_SAVE, (async (_event, data: {
    scene_id: number
    project_id: number
    x: number
    y: number
  }) => {
    try {
      const position = scenePositionRepo.upsert(data)
      return position
    } catch (error) {
      console.error('Failed to save scene position:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.SCENE_POSITION_GET_BY_PROJECT, (async (_event, projectId: number) => {
    return scenePositionRepo.findByProject(projectId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.SCENE_POSITION_GET_BY_SCENE, (async (_event, sceneId: number) => {
    return scenePositionRepo.findByScene(sceneId)
  }) as IpcHandler)

  // Plotline handlers
  ipcMain.handle(IPC_CHANNELS.PLOTLINE_CREATE, (async (_event, data) => {
    try {
      console.log('IPC: Creating plotline:', data)
      const plotline = plotlineRepo.create(data)
      console.log('IPC: Plotline created:', plotline)
      return plotline
    } catch (error) {
      console.error('IPC: Failed to create plotline:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.PLOTLINE_GET, (async (_event, id: number) => {
    return plotlineRepo.getById(id)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.PLOTLINE_GET_BY_PROJECT, (async (_event, projectId: number) => {
    return plotlineRepo.getByProjectId(projectId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.PLOTLINE_UPDATE, (async (_event, id: number, data) => {
    return plotlineRepo.update(id, data)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.PLOTLINE_DELETE, (async (_event, id: number) => {
    plotlineRepo.delete(id)
    return { success: true }
  }) as IpcHandler)

  // World Setting handlers
  ipcMain.handle(IPC_CHANNELS.WORLD_SETTING_CREATE, (async (_event, data) => {
    try {
      console.log('IPC: Creating world setting:', data)
      const setting = worldSettingRepo.create(data)
      console.log('IPC: World setting created:', setting)
      return setting
    } catch (error) {
      console.error('IPC: Failed to create world setting:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.WORLD_SETTING_GET, (async (_event, id: number) => {
    return worldSettingRepo.getById(id)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.WORLD_SETTING_GET_BY_PROJECT, (async (_event, projectId: number) => {
    return worldSettingRepo.getByProjectId(projectId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.WORLD_SETTING_UPDATE, (async (_event, id: number, data) => {
    return worldSettingRepo.update(id, data)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.WORLD_SETTING_DELETE, (async (_event, id: number) => {
    worldSettingRepo.delete(id)
    return { success: true }
  }) as IpcHandler)

  // Timeline Event handlers
  ipcMain.handle(IPC_CHANNELS.TIMELINE_EVENT_CREATE, (async (_event, data) => {
    try {
      console.log('IPC: Creating timeline event:', data)
      const event = timelineEventRepo.create(data)
      console.log('IPC: Timeline event created:', event)
      return event
    } catch (error) {
      console.error('IPC: Failed to create timeline event:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.TIMELINE_EVENT_GET, (async (_event, id: number) => {
    return timelineEventRepo.getById(id)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.TIMELINE_EVENT_GET_BY_PROJECT, (async (_event, projectId: number) => {
    return timelineEventRepo.getByProject(projectId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.TIMELINE_EVENT_GET_BY_TIMELINE, (async (_event, projectId: number, timelineName: string) => {
    return timelineEventRepo.getByTimeline(projectId, timelineName)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.TIMELINE_EVENT_UPDATE, (async (_event, id: number, data) => {
    return timelineEventRepo.update(id, data)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.TIMELINE_EVENT_DELETE, (async (_event, id: number) => {
    timelineEventRepo.delete(id)
    return { success: true }
  }) as IpcHandler)

  // Timeline Track handlers
  ipcMain.handle(IPC_CHANNELS.TIMELINE_TRACK_CREATE, (async (_event, data) => {
    try {
      console.log('IPC: Creating timeline track:', data)
      const track = timelineTrackRepo.create(data)
      console.log('IPC: Timeline track created:', track)
      return track
    } catch (error) {
      console.error('IPC: Failed to create timeline track:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.TIMELINE_TRACK_GET, (async (_event, id: number) => {
    return timelineTrackRepo.getById(id)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.TIMELINE_TRACK_GET_BY_PROJECT, (async (_event, projectId: number) => {
    return timelineTrackRepo.getByProject(projectId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.TIMELINE_TRACK_UPDATE, (async (_event, id: number, data) => {
    return timelineTrackRepo.update(id, data)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.TIMELINE_TRACK_DELETE, (async (_event, id: number) => {
    timelineTrackRepo.delete(id)
    return { success: true }
  }) as IpcHandler)

  // AI Config handlers
  ipcMain.handle(IPC_CHANNELS.AI_CONFIG_CREATE, (async (_event, data) => {
    try {
      console.log('IPC: Creating AI config:', data)
      const config = aiConfigRepo.create(data)
      console.log('IPC: AI config created:', config)
      return config
    } catch (error) {
      console.error('IPC: Failed to create AI config:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.AI_CONFIG_GET, (async (_event, id: number) => {
    return aiConfigRepo.getById(id)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.AI_CONFIG_GET_ALL, async () => {
    return aiConfigRepo.getAll()
  })

  ipcMain.handle(IPC_CHANNELS.AI_CONFIG_UPDATE, (async (_event, id: number, data) => {
    return aiConfigRepo.update(id, data)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.AI_CONFIG_DELETE, (async (_event, id: number) => {
    aiConfigRepo.delete(id)
    return { success: true }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.AI_CONFIG_SET_DEFAULT, (async (_event, id: number) => {
    aiConfigRepo.setDefault(id)
    return { success: true }
  }) as IpcHandler)

  // AI Service handlers
  ipcMain.handle(IPC_CHANNELS.AI_GENERATE, (async (_event, prompt: string, systemPrompt?: string) => {
    try {
      const config = aiConfigRepo.getDefault()
      if (!config) {
        throw new Error('No default AI config found')
      }

      const aiService = new AIService(config)
      const result = await aiService.generate(prompt, systemPrompt)
      return result
    } catch (error) {
      console.error('IPC: AI generate failed:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.AI_CONTINUE_WRITING, (async (_event, content: string, wordCount?: number) => {
    try {
      const config = aiConfigRepo.getDefault()
      if (!config) {
        throw new Error('No default AI config found')
      }

      const aiService = new AIService(config)
      const result = await aiService.continueWriting(content, wordCount)
      return result
    } catch (error) {
      console.error('IPC: AI continue writing failed:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.AI_POLISH, (async (_event, content: string) => {
    try {
      const config = aiConfigRepo.getDefault()
      if (!config) {
        throw new Error('No default AI config found')
      }

      const aiService = new AIService(config)
      const result = await aiService.polishText(content)
      return result
    } catch (error) {
      console.error('IPC: AI polish failed:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.AI_GENERATE_DIALOGUE, (async (_event, character1: string, character2: string, context: string) => {
    try {
      const config = aiConfigRepo.getDefault()
      if (!config) {
        throw new Error('No default AI config found')
      }

      const aiService = new AIService(config)
      const result = await aiService.generateDialogue(character1, character2, context)
      return result
    } catch (error) {
      console.error('IPC: AI generate dialogue failed:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.AI_GENERATE_DESCRIPTION, (async (_event, sceneName: string, atmosphere: string) => {
    try {
      const config = aiConfigRepo.getDefault()
      if (!config) {
        throw new Error('No default AI config found')
      }

      const aiService = new AIService(config)
      const result = await aiService.generateSceneDescription(sceneName, atmosphere)
      return result
    } catch (error) {
      console.error('IPC: AI generate description failed:', error)
      throw error
    }
  }) as IpcHandler)

  // AI Review handlers
  ipcMain.handle(IPC_CHANNELS.AI_REVIEW_CREATE, (async (_event, data) => {
    try {
      console.log('IPC: Creating AI review')
      const review = aiReviewRepo.create(data)
      console.log('IPC: AI review created:', review)
      return review
    } catch (error) {
      console.error('IPC: Failed to create AI review:', error)
      throw error
    }
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.AI_REVIEW_GET, (async (_event, id: number) => {
    return aiReviewRepo.getById(id)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.AI_REVIEW_GET_BY_PROJECT, (async (_event, projectId: number) => {
    return aiReviewRepo.getByProject(projectId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.AI_REVIEW_GET_BY_CHAPTER, (async (_event, chapterId: number) => {
    return aiReviewRepo.getByChapter(chapterId)
  }) as IpcHandler)

  ipcMain.handle(IPC_CHANNELS.AI_REVIEW_DELETE, (async (_event, id: number) => {
    aiReviewRepo.delete(id)
    return { success: true }
  }) as IpcHandler)
}