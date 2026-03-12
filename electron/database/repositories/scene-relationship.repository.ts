import type Database from 'better-sqlite3'
import type { SceneRelationship } from '../../src/types/scene'

export class SceneRelationshipRepository {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  create(data: {
    project_id: number
    scene1_id: number
    scene2_id: number
    relationship_type: string
    description?: string
  }): SceneRelationship {
    const stmt = this.db.prepare(`
      INSERT INTO scene_relationships (project_id, scene1_id, scene2_id, relationship_type, description)
      VALUES (@project_id, @scene1_id, @scene2_id, @relationship_type, @description)
    `)

    const result = stmt.run({
      project_id: data.project_id,
      scene1_id: data.scene1_id,
      scene2_id: data.scene2_id,
      relationship_type: data.relationship_type,
      description: data.description || null,
    })

    return this.getById(result.lastInsertRowid as number)!
  }

  getById(id: number): SceneRelationship | undefined {
    const stmt = this.db.prepare('SELECT * FROM scene_relationships WHERE id = ?')
    return stmt.get(id) as SceneRelationship | undefined
  }

  findByProject(projectId: number): SceneRelationship[] {
    const stmt = this.db.prepare('SELECT * FROM scene_relationships WHERE project_id = ?')
    return stmt.all(projectId) as SceneRelationship[]
  }

  findByScene(sceneId: number): SceneRelationship[] {
    const stmt = this.db.prepare(
      'SELECT * FROM scene_relationships WHERE scene1_id = ? OR scene2_id = ?'
    )
    return stmt.all(sceneId, sceneId) as SceneRelationship[]
  }

  update(id: number, data: { relationship_type?: string; description?: string }): SceneRelationship | undefined {
    const fields: string[] = []
    const values: any = { id }

    if (data.relationship_type !== undefined) {
      fields.push('relationship_type = @relationship_type')
      values.relationship_type = data.relationship_type
    }
    if (data.description !== undefined) {
      fields.push('description = @description')
      values.description = data.description
    }

    if (fields.length === 0) {
      return this.getById(id)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')

    const stmt = this.db.prepare(`
      UPDATE scene_relationships
      SET ${fields.join(', ')}
      WHERE id = @id
    `)

    stmt.run(values)
    return this.getById(id)
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM scene_relationships WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  deleteByScene(sceneId: number): void {
    const stmt = this.db.prepare(
      'DELETE FROM scene_relationships WHERE scene1_id = ? OR scene2_id = ?'
    )
    stmt.run(sceneId, sceneId)
  }
}