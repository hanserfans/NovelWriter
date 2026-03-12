import Database from 'better-sqlite3'
import { BaseRepository } from './base.repository'

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

export class SceneRepository extends BaseRepository<Scene> {
  constructor(db: Database.Database) {
    super(db, 'scenes')
  }

  create(data: {
    project_id: number
    name: string
    location?: string
    atmosphere?: string
    description?: string
    notes?: string
  }): Scene {
    const result = this.insert(data)
    return this.findById(result.lastInsertRowid as number)!
  }

  updateScene(
    id: number,
    data: Partial<
      Pick<Scene, 'name' | 'location' | 'atmosphere' | 'description' | 'notes'>
    >
  ): Scene | undefined {
    this.update(id, data)
    return this.findById(id)
  }

  findByProject(projectId: number): Scene[] {
    const stmt = this.db.prepare(
      'SELECT * FROM scenes WHERE project_id = ? ORDER BY created_at DESC'
    )
    return stmt.all(projectId) as Scene[]
  }

  search(projectId: number, keyword: string): Scene[] {
    const stmt = this.db.prepare(`
      SELECT * FROM scenes
      WHERE project_id = ? AND (
        name LIKE ? OR
        location LIKE ? OR
        atmosphere LIKE ? OR
        description LIKE ? OR
        notes LIKE ?
      )
      ORDER BY created_at DESC
    `)
    const searchTerm = `%${keyword}%`
    return stmt.all(
      projectId,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm
    ) as Scene[]
  }

  findByLocation(projectId: number, location: string): Scene[] {
    const stmt = this.db.prepare(
      'SELECT * FROM scenes WHERE project_id = ? AND location = ? ORDER BY created_at DESC'
    )
    return stmt.all(projectId, location) as Scene[]
  }
}