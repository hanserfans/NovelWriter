import Database from 'better-sqlite3'
import { BaseRepository } from './base.repository'

export interface CharacterPosition {
  id: number
  character_id: number
  project_id: number
  x: number
  y: number
  created_at: string
  updated_at: string
}

export class CharacterPositionRepository extends BaseRepository<CharacterPosition> {
  constructor(db: Database.Database) {
    super(db, 'character_positions')
  }

  create(data: {
    character_id: number
    project_id: number
    x: number
    y: number
  }): CharacterPosition {
    const result = this.insert(data)
    return this.findById(result.lastInsertRowid as number)!
  }

  updatePosition(id: number, x: number, y: number): CharacterPosition | undefined {
    const stmt = this.db.prepare(
      'UPDATE character_positions SET x = ?, y = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
    stmt.run(x, y, id)
    return this.findById(id)
  }

  findByCharacter(characterId: number): CharacterPosition | undefined {
    return this.findOneByField('character_id', characterId)
  }

  findByProject(projectId: number): CharacterPosition[] {
    return this.findByField('project_id', projectId)
  }

  upsert(data: {
    character_id: number
    project_id: number
    x: number
    y: number
  }): CharacterPosition {
    const existing = this.findByCharacter(data.character_id)
    if (existing) {
      return this.updatePosition(existing.id, data.x, data.y)!
    }
    return this.create(data)
  }
}