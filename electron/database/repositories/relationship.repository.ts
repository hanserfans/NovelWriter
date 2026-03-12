import Database from 'better-sqlite3'
import { BaseRepository } from './base.repository'

export interface CharacterRelationship {
  id: number
  project_id: number
  character1_id: number
  character2_id: number
  relationship_type: string
  description: string | null
  created_at: string
  updated_at: string
}

export class CharacterRelationshipRepository extends BaseRepository<CharacterRelationship> {
  constructor(db: Database.Database) {
    super(db, 'character_relationships')
  }

  create(data: {
    project_id: number
    character1_id: number
    character2_id: number
    relationship_type: string
    description?: string
  }): CharacterRelationship {
    const result = this.insert(data)
    return this.findById(result.lastInsertRowid as number)!
  }

  updateRelationship(
    id: number,
    data: Partial<Pick<CharacterRelationship, 'relationship_type' | 'description'>>
  ): CharacterRelationship | undefined {
    this.update(id, data)
    return this.findById(id)
  }

  findByProject(projectId: number): CharacterRelationship[] {
    const stmt = this.db.prepare(
      'SELECT * FROM character_relationships WHERE project_id = ?'
    )
    return stmt.all(projectId) as CharacterRelationship[]
  }

  findByCharacter(characterId: number): CharacterRelationship[] {
    const stmt = this.db.prepare(`
      SELECT * FROM character_relationships
      WHERE character1_id = ? OR character2_id = ?
    `)
    return stmt.all(characterId, characterId) as CharacterRelationship[]
  }

  findByCharacters(char1Id: number, char2Id: number): CharacterRelationship | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM character_relationships
      WHERE (character1_id = ? AND character2_id = ?)
         OR (character1_id = ? AND character2_id = ?)
      LIMIT 1
    `)
    return stmt.get(char1Id, char2Id, char2Id, char1Id) as CharacterRelationship | undefined
  }

  deleteByCharacter(characterId: number): void {
    const stmt = this.db.prepare(`
      DELETE FROM character_relationships
      WHERE character1_id = ? OR character2_id = ?
    `)
    stmt.run(characterId, characterId)
  }
}