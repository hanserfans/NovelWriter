class IpcClient {
  private invoke<T>(channel: string, ...args: any[]): Promise<T> {
    return window.api.invoke(channel, ...args)
  }

  // Project APIs
  async createProject(data: {
    title: string
    description?: string
    genre?: string
    cover_image?: string
  }) {
    return this.invoke('project:create', data)
  }

  async getProject(id: number) {
    return this.invoke('project:get', id)
  }

  async getAllProjects() {
    return this.invoke('project:getAll')
  }

  async updateProject(id: number, data: any) {
    return this.invoke('project:update', id, data)
  }

  async deleteProject(id: number) {
    return this.invoke('project:delete', id)
  }

  async searchProjects(keyword: string) {
    return this.invoke('project:search', keyword)
  }

  async getProjectStats(id: number) {
    return this.invoke('project:getStats', id)
  }

  // Chapter APIs
  async createChapter(data: {
    project_id: number
    title: string
    volume_id?: number
    content?: string
    status?: 'draft' | 'writing' | 'completed'
  }) {
    return this.invoke('chapter:create', data)
  }

  async getChapter(id: number) {
    return this.invoke('chapter:get', id)
  }

  async getChaptersByProject(projectId: number) {
    return this.invoke('chapter:getByProject', projectId)
  }

  async getChaptersByVolume(volumeId: number) {
    return this.invoke('chapter:getByVolume', volumeId)
  }

  async updateChapter(id: number, data: any) {
    return this.invoke('chapter:update', id, data)
  }

  async deleteChapter(id: number) {
    return this.invoke('chapter:delete', id)
  }

  async updateChapterOrder(id: number, orderIndex: number) {
    return this.invoke('chapter:updateOrder', id, orderIndex)
  }

  async moveChapter(id: number, newVolumeId: number | null, newOrderIndex: number) {
    return this.invoke('chapter:move', id, newVolumeId, newOrderIndex)
  }

  // Character APIs
  async createCharacter(data: {
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
  }) {
    return this.invoke('character:create', data)
  }

  async getCharacter(id: number) {
    return this.invoke('character:get', id)
  }

  async getCharactersByProject(projectId: number) {
    return this.invoke('character:getByProject', projectId)
  }

  async updateCharacter(id: number, data: any) {
    return this.invoke('character:update', id, data)
  }

  async deleteCharacter(id: number) {
    return this.invoke('character:delete', id)
  }

  // Relationship APIs
  async createRelationship(data: {
    project_id: number
    character1_id: number
    character2_id: number
    relationship_type: string
    description?: string
  }) {
    return this.invoke('relationship:create', data)
  }

  async getRelationship(id: number) {
    return this.invoke('relationship:get', id)
  }

  async getRelationshipsByProject(projectId: number) {
    return this.invoke('relationship:getByProject', projectId)
  }

  async getRelationshipsByCharacter(characterId: number) {
    return this.invoke('relationship:getByCharacter', characterId)
  }

  async updateRelationship(id: number, data: any) {
    return this.invoke('relationship:update', id, data)
  }

  async deleteRelationship(id: number) {
    return this.invoke('relationship:delete', id)
  }

  // Position APIs
  async savePosition(data: {
    character_id: number
    project_id: number
    x: number
    y: number
  }) {
    return this.invoke('position:save', data)
  }

  async getPositionsByProject(projectId: number) {
    return this.invoke('position:getByProject', projectId)
  }

  async getPositionByCharacter(characterId: number) {
    return this.invoke('position:getByCharacter', characterId)
  }

  // Scene APIs
  async createScene(data: {
    project_id: number
    name: string
    location?: string
    atmosphere?: string
    description?: string
    notes?: string
  }) {
    return this.invoke('scene:create', data)
  }

  async getScene(id: number) {
    return this.invoke('scene:get', id)
  }

  async getScenesByProject(projectId: number) {
    return this.invoke('scene:getByProject', projectId)
  }

  async updateScene(id: number, data: any) {
    return this.invoke('scene:update', id, data)
  }

  async deleteScene(id: number) {
    return this.invoke('scene:delete', id)
  }

  // Scene Relationship APIs
  async createSceneRelationship(data: {
    project_id: number
    scene1_id: number
    scene2_id: number
    relationship_type: string
    description?: string
  }) {
    return this.invoke('sceneRelationship:create', data)
  }

  async getSceneRelationship(id: number) {
    return this.invoke('sceneRelationship:get', id)
  }

  async getSceneRelationshipsByProject(projectId: number) {
    return this.invoke('sceneRelationship:getByProject', projectId)
  }

  async getSceneRelationshipsByScene(sceneId: number) {
    return this.invoke('sceneRelationship:getByScene', sceneId)
  }

  async updateSceneRelationship(id: number, data: any) {
    return this.invoke('sceneRelationship:update', id, data)
  }

  async deleteSceneRelationship(id: number) {
    return this.invoke('sceneRelationship:delete', id)
  }

  // Scene Position APIs
  async saveScenePosition(data: {
    scene_id: number
    project_id: number
    x: number
    y: number
  }) {
    return this.invoke('scenePosition:save', data)
  }

  async getScenePositionsByProject(projectId: number) {
    return this.invoke('scenePosition:getByProject', projectId)
  }

  async getScenePositionByScene(sceneId: number) {
    return this.invoke('scenePosition:getByScene', sceneId)
  }

  // Plotline APIs
  async createPlotline(data: {
    project_id: number
    title: string
    type?: 'main' | 'sub'
    start_chapter_id?: number
    end_chapter_id?: number
    status?: 'planning' | 'writing' | 'completed'
    description?: string
    notes?: string
  }) {
    return this.invoke('plotline:create', data)
  }

  async getPlotline(id: number) {
    return this.invoke('plotline:get', id)
  }

  async getPlotlinesByProject(projectId: number) {
    return this.invoke('plotline:getByProject', projectId)
  }

  async updatePlotline(id: number, data: any) {
    return this.invoke('plotline:update', id, data)
  }

  async deletePlotline(id: number) {
    return this.invoke('plotline:delete', id)
  }

  // World Setting APIs
  async createWorldSetting(data: {
    project_id: number
    category: string
    title: string
    content?: string
  }) {
    return this.invoke('worldSetting:create', data)
  }

  async getWorldSetting(id: number) {
    return this.invoke('worldSetting:get', id)
  }

  async getWorldSettingsByProject(projectId: number) {
    return this.invoke('worldSetting:getByProject', projectId)
  }

  async updateWorldSetting(id: number, data: any) {
    return this.invoke('worldSetting:update', id, data)
  }

  async deleteWorldSetting(id: number) {
    return this.invoke('worldSetting:delete', id)
  }

  // Timeline Event APIs
  async createTimelineEvent(data: {
    project_id: number
    title: string
    description?: string
    event_type?: 'event' | 'milestone' | 'period'
    timeline_name?: string
    start_date: string
    end_date?: string
    color?: string
    metadata?: string
  }) {
    return this.invoke('timelineEvent:create', data)
  }

  async getTimelineEvent(id: number) {
    return this.invoke('timelineEvent:get', id)
  }

  async getTimelineEventsByProject(projectId: number) {
    return this.invoke('timelineEvent:getByProject', projectId)
  }

  async getTimelineEventsByTimeline(projectId: number, timelineName: string) {
    return this.invoke('timelineEvent:getByTimeline', projectId, timelineName)
  }

  async updateTimelineEvent(id: number, data: any) {
    return this.invoke('timelineEvent:update', id, data)
  }

  async deleteTimelineEvent(id: number) {
    return this.invoke('timelineEvent:delete', id)
  }

  // Timeline Track APIs
  async createTimelineTrack(data: {
    project_id: number
    name: string
    color?: string
    order_index?: number
  }) {
    return this.invoke('timelineTrack:create', data)
  }

  async getTimelineTrack(id: number) {
    return this.invoke('timelineTrack:get', id)
  }

  async getTimelineTracksByProject(projectId: number) {
    return this.invoke('timelineTrack:getByProject', projectId)
  }

  async updateTimelineTrack(id: number, data: any) {
    return this.invoke('timelineTrack:update', id, data)
  }

  async deleteTimelineTrack(id: number) {
    return this.invoke('timelineTrack:delete', id)
  }

  // AI Config APIs
  async createAIConfig(data: {
    name: string
    provider: 'openai' | 'anthropic'
    api_key: string
    model: string
    temperature?: number
    max_tokens?: number
    is_default?: boolean
  }) {
    return this.invoke('aiConfig:create', data)
  }

  async getAIConfig(id: number) {
    return this.invoke('aiConfig:get', id)
  }

  async getAllAIConfigs() {
    return this.invoke('aiConfig:getAll')
  }

  async updateAIConfig(id: number, data: any) {
    return this.invoke('aiConfig:update', id, data)
  }

  async deleteAIConfig(id: number) {
    return this.invoke('aiConfig:delete', id)
  }

  async setDefaultAIConfig(id: number) {
    return this.invoke('aiConfig:setDefault', id)
  }

  // AI Service APIs
  async aiGenerate(prompt: string, systemPrompt?: string) {
    return this.invoke('ai:generate', prompt, systemPrompt)
  }

  async aiContinueWriting(content: string, wordCount?: number) {
    return this.invoke('ai:continueWriting', content, wordCount)
  }

  async aiPolish(content: string) {
    return this.invoke('ai:polish', content)
  }

  async aiGenerateDialogue(character1: string, character2: string, context: string) {
    return this.invoke('ai:generateDialogue', character1, character2, context)
  }

  async aiGenerateDescription(sceneName: string, atmosphere: string) {
    return this.invoke('ai:generateDescription', sceneName, atmosphere)
  }

  // AI Review APIs
  async createAIReview(data: {
    project_id: number
    chapter_id?: number
    selected_text: string
    review_type: string
    review_result: string
  }) {
    return this.invoke('aiReview:create', data)
  }

  async getAIReview(id: number) {
    return this.invoke('aiReview:get', id)
  }

  async getAIReviewsByProject(projectId: number) {
    return this.invoke('aiReview:getByProject', projectId)
  }

  async getAIReviewsByChapter(chapterId: number) {
    return this.invoke('aiReview:getByChapter', chapterId)
  }

  async deleteAIReview(id: number) {
    return this.invoke('aiReview:delete', id)
  }

  // Export APIs
  async exportChapter(chapterId: number, format: 'txt' | 'docx' | 'pdf') {
    return this.invoke('export:chapter', chapterId, format)
  }

  async exportProject(projectId: number, format: 'txt' | 'docx' | 'pdf') {
    return this.invoke('export:project', projectId, format)
  }
}

export const ipcClient = new IpcClient()