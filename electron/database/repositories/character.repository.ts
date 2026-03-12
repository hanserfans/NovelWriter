import Database from 'better-sqlite3'
import { BaseRepository } from './base.repository'

export interface Character {
  id: number
  project_id: number
  name: string
  avatar: string | null
  gender: string | null
  age: number | null
  appearance: string | null
  personality: string | null
  background: string | null
  abilities: string | null
  relationships: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export class CharacterRepository extends BaseRepository<Character> {
  constructor(db: Database.Database) {
    super(db, 'characters')
  }

  create(data: {
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
  }): Character {
    const result = this.insert(data)
    return this.findById(result.lastInsertRowid as number)!
  }

  updateCharacter(
    id: number,
    data: Partial<
      Pick<
        Character,
        | 'name'
        | 'avatar'
        | 'gender'
        | 'age'
        | 'appearance'
        | 'personality'
        | 'background'
        | 'abilities'
        | 'relationships'
        | 'notes'
      >
    >
  ): Character | undefined {
    this.update(id, data)
    return this.findById(id)
  }

  findByProject(projectId: number): Character[] {
    const stmt = this.db.prepare(
      'SELECT * FROM characters WHERE project_id = ? ORDER BY created_at DESC'
    )
    return stmt.all(projectId) as Character[]
  }

  search(projectId: number, keyword: string): Character[] {
    const stmt = this.db.prepare(`
      SELECT * FROM characters
      WHERE project_id = ? AND (
        name LIKE ? OR
        appearance LIKE ? OR
        personality LIKE ? OR
        background LIKE ? OR
        abilities LIKE ? OR
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
      searchTerm,
      searchTerm
    ) as Character[]
  }

  findByGender(projectId: number, gender: string): Character[] {
    const stmt = this.db.prepare(
      'SELECT * FROM characters WHERE project_id = ? AND gender = ? ORDER BY created_at DESC'
    )
    return stmt.all(projectId, gender) as Character[]
  }
}