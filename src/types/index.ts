// Project types
export interface Project {
  id: number
  title: string
  description: string
  genre: string
  word_count: number
  chapter_count: number
  cover_image?: string
  status: 'draft' | 'writing' | 'completed'
  created_at: string
  updated_at: string
}

// Volume and Chapter types
export interface Volume {
  id: number
  project_id: number
  title: string
  order_index: number
  created_at: string
}

export interface Chapter {
  id: number
  volume_id: number
  project_id: number
  title: string
  content: string
  word_count: number
  order_index: number
  status: 'draft' | 'writing' | 'completed'
  created_at: string
  updated_at: string
}

// Character types
export interface Character {
  id: number
  project_id: number
  name: string
  avatar?: string
  gender: string
  age?: number
  appearance?: string
  personality?: string
  background?: string
  abilities?: string
  relationships?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Character Relationship types
export interface CharacterRelationship {
  id: number
  project_id: number
  character1_id: number
  character2_id: number
  relationship_type: string
  description?: string
  created_at: string
  updated_at: string
}

// Scene types
export interface Scene {
  id: number
  project_id: number
  name: string
  location: string
  atmosphere?: string
  description?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface SceneRelationship {
  id: number
  project_id: number
  scene1_id: number
  scene2_id: number
  relationship_type: string
  description?: string
  created_at: string
  updated_at: string
}

export interface ScenePosition {
  id: number
  scene_id: number
  project_id: number
  x: number
  y: number
  created_at: string
  updated_at: string
}

// Timeline types
export interface TimelineEvent {
  id: number
  project_id: number
  title: string
  description?: string
  event_type: 'event' | 'milestone' | 'period'
  timeline_name: string
  start_date: string
  end_date?: string
  color: string
  metadata?: string
  created_at: string
  updated_at: string
}

export interface TimelineTrack {
  id: number
  project_id: number
  name: string
  color: string
  order_index: number
  created_at: string
  updated_at: string
}

// Plotline types
export interface Plotline {
  id: number
  project_id: number
  title: string
  type: 'main' | 'sub'
  start_chapter_id?: number
  end_chapter_id?: number
  status: 'planning' | 'writing' | 'completed'
  description?: string
  notes?: string
  created_at: string
  updated_at: string
}

// World setting types
export interface WorldSetting {
  id: number
  project_id: number
  category: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

// Note types
export interface Note {
  id: number
  project_id: number
  title: string
  content: string
  category?: string
  tags?: string
  created_at: string
  updated_at: string
}

// AI Config types
export interface AIConfig {
  id: number
  name: string
  provider: 'openai' | 'anthropic'
  api_key: string
  model: string
  temperature: number
  max_tokens: number
  is_default: boolean
  created_at: string
  updated_at: string
}

// Prompt Template types
export interface PromptTemplate {
  id: number
  name: string
  category: string
  template: string
  variables: string // JSON string
  description?: string
  created_at: string
  updated_at: string
}

// AI Chat types
export interface AIChat {
  id: number
  project_id?: number
  chapter_id?: number
  role: 'user' | 'assistant'
  content: string
  model: string
  tokens_used?: number
  created_at: string
}

// AI Review types
export interface AIReview {
  id: number
  project_id: number
  chapter_id?: number
  selected_text: string
  review_type: string
  review_result: string
  created_at: string
}