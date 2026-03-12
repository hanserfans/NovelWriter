export interface Scene {
  id: number
  project_id: number
  name: string
  location: string | null
  atmosphere: string | null
  description: string | null
  notes: string | null
  created_at: string
  updated_at: string
}