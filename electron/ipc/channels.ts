// IPC Channel definitions
export const IPC_CHANNELS = {
  // Project channels
  PROJECT_CREATE: 'project:create',
  PROJECT_GET: 'project:get',
  PROJECT_GET_ALL: 'project:getAll',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_SEARCH: 'project:search',
  PROJECT_GET_STATS: 'project:getStats',

  // Chapter channels
  CHAPTER_CREATE: 'chapter:create',
  CHAPTER_GET: 'chapter:get',
  CHAPTER_GET_BY_PROJECT: 'chapter:getByProject',
  CHAPTER_GET_BY_VOLUME: 'chapter:getByVolume',
  CHAPTER_UPDATE: 'chapter:update',
  CHAPTER_DELETE: 'chapter:delete',
  CHAPTER_UPDATE_ORDER: 'chapter:updateOrder',
  CHAPTER_MOVE: 'chapter:move',

  // Volume channels
  VOLUME_CREATE: 'volume:create',
  VOLUME_GET: 'volume:get',
  VOLUME_GET_BY_PROJECT: 'volume:getByProject',
  VOLUME_UPDATE: 'volume:update',
  VOLUME_DELETE: 'volume:delete',

  // Character channels
  CHARACTER_CREATE: 'character:create',
  CHARACTER_GET: 'character:get',
  CHARACTER_GET_BY_PROJECT: 'character:getByProject',
  CHARACTER_UPDATE: 'character:update',
  CHARACTER_DELETE: 'character:delete',

  // Character Relationship channels
  RELATIONSHIP_CREATE: 'relationship:create',
  RELATIONSHIP_GET: 'relationship:get',
  RELATIONSHIP_GET_BY_PROJECT: 'relationship:getByProject',
  RELATIONSHIP_GET_BY_CHARACTER: 'relationship:getByCharacter',
  RELATIONSHIP_UPDATE: 'relationship:update',
  RELATIONSHIP_DELETE: 'relationship:delete',

  // Character Position channels
  POSITION_SAVE: 'position:save',
  POSITION_GET_BY_PROJECT: 'position:getByProject',
  POSITION_GET_BY_CHARACTER: 'position:getByCharacter',

  // Scene channels
  SCENE_CREATE: 'scene:create',
  SCENE_GET: 'scene:get',
  SCENE_GET_BY_PROJECT: 'scene:getByProject',
  SCENE_UPDATE: 'scene:update',
  SCENE_DELETE: 'scene:delete',

  // Scene Relationship channels
  SCENE_RELATIONSHIP_CREATE: 'sceneRelationship:create',
  SCENE_RELATIONSHIP_GET: 'sceneRelationship:get',
  SCENE_RELATIONSHIP_GET_BY_PROJECT: 'sceneRelationship:getByProject',
  SCENE_RELATIONSHIP_GET_BY_SCENE: 'sceneRelationship:getByScene',
  SCENE_RELATIONSHIP_UPDATE: 'sceneRelationship:update',
  SCENE_RELATIONSHIP_DELETE: 'sceneRelationship:delete',

  // Scene Position channels
  SCENE_POSITION_SAVE: 'scenePosition:save',
  SCENE_POSITION_GET_BY_PROJECT: 'scenePosition:getByProject',
  SCENE_POSITION_GET_BY_SCENE: 'scenePosition:getByScene',

  // Timeline Event channels
  TIMELINE_EVENT_CREATE: 'timelineEvent:create',
  TIMELINE_EVENT_GET: 'timelineEvent:get',
  TIMELINE_EVENT_GET_BY_PROJECT: 'timelineEvent:getByProject',
  TIMELINE_EVENT_GET_BY_TIMELINE: 'timelineEvent:getByTimeline',
  TIMELINE_EVENT_UPDATE: 'timelineEvent:update',
  TIMELINE_EVENT_DELETE: 'timelineEvent:delete',

  // Timeline Track channels
  TIMELINE_TRACK_CREATE: 'timelineTrack:create',
  TIMELINE_TRACK_GET: 'timelineTrack:get',
  TIMELINE_TRACK_GET_BY_PROJECT: 'timelineTrack:getByProject',
  TIMELINE_TRACK_UPDATE: 'timelineTrack:update',
  TIMELINE_TRACK_DELETE: 'timelineTrack:delete',

  // Plotline channels
  PLOTLINE_CREATE: 'plotline:create',
  PLOTLINE_GET: 'plotline:get',
  PLOTLINE_GET_BY_PROJECT: 'plotline:getByProject',
  PLOTLINE_UPDATE: 'plotline:update',
  PLOTLINE_DELETE: 'plotline:delete',

  // World settings channels
  WORLD_SETTING_CREATE: 'worldSetting:create',
  WORLD_SETTING_GET: 'worldSetting:get',
  WORLD_SETTING_GET_BY_PROJECT: 'worldSetting:getByProject',
  WORLD_SETTING_UPDATE: 'worldSetting:update',
  WORLD_SETTING_DELETE: 'worldSetting:delete',

  // Note channels
  NOTE_CREATE: 'note:create',
  NOTE_GET: 'note:get',
  NOTE_GET_BY_PROJECT: 'note:getByProject',
  NOTE_UPDATE: 'note:update',
  NOTE_DELETE: 'note:delete',

  // AI Config channels
  AI_CONFIG_CREATE: 'aiConfig:create',
  AI_CONFIG_GET: 'aiConfig:get',
  AI_CONFIG_GET_ALL: 'aiConfig:getAll',
  AI_CONFIG_UPDATE: 'aiConfig:update',
  AI_CONFIG_DELETE: 'aiConfig:delete',
  AI_CONFIG_SET_DEFAULT: 'aiConfig:setDefault',

  // Prompt Template channels
  PROMPT_TEMPLATE_CREATE: 'promptTemplate:create',
  PROMPT_TEMPLATE_GET: 'promptTemplate:get',
  PROMPT_TEMPLATE_GET_ALL: 'promptTemplate:getAll',
  PROMPT_TEMPLATE_UPDATE: 'promptTemplate:update',
  PROMPT_TEMPLATE_DELETE: 'promptTemplate:delete',

  // AI Chat channels
  AI_CHAT_CREATE: 'aiChat:create',
  AI_CHAT_GET_BY_PROJECT: 'aiChat:getByProject',
  AI_CHAT_GET_BY_CHAPTER: 'aiChat:getByChapter',
  AI_CHAT_DELETE: 'aiChat:delete',

  // AI Service channels
  AI_GENERATE: 'ai:generate',
  AI_GENERATE_STREAM: 'ai:generateStream',
  AI_CONTINUE_WRITING: 'ai:continueWriting',
  AI_POLISH: 'ai:polish',
  AI_GENERATE_DIALOGUE: 'ai:generateDialogue',
  AI_GENERATE_DESCRIPTION: 'ai:generateDescription',

  // AI Review channels
  AI_REVIEW_CREATE: 'aiReview:create',
  AI_REVIEW_GET: 'aiReview:get',
  AI_REVIEW_GET_BY_PROJECT: 'aiReview:getByProject',
  AI_REVIEW_GET_BY_CHAPTER: 'aiReview:getByChapter',
  AI_REVIEW_DELETE: 'aiReview:delete',

  // Export channels
  EXPORT_TXT: 'export:txt',
  EXPORT_DOCX: 'export:docx',
  EXPORT_PDF: 'export:pdf',
  IMPORT_TXT: 'import:txt',

  // Backup channels
  BACKUP_CREATE: 'backup:create',
  BACKUP_RESTORE: 'backup:restore',
  BACKUP_LIST: 'backup:list',

  // Database channels
  DATABASE_BACKUP: 'database:backup',
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]