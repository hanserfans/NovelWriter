import type Database from 'better-sqlite3'
import type { ScenePosition } from '../../src/types/scene'

export class ScenePositionRepository {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  upsert(data: { scene_id: number; project_id: number; x: number; y: number }): ScenePosition {
    const stmt = this.db.prepare(`
      INSERT INTO scene_positions (scene_id, project_id, x, y)
      VALUES (@scene_id, @project_id, @x, @y)
      ON CONFLICT(scene_id) DO UPDATE SET
        x = excluded.x,
        y = excluded.y,
        updated_at = CURRENT_TIMESTAMP
    `)

    const result = stmt.run(data)
    return this.getById(result.lastInsertRowid as number)!
  }

  getById(id: number): ScenePosition | undefined {
    const stmt = this.db.prepare('SELECT * FROM scene_positions WHERE id = ?')
    return stmt.get(id) as ScenePosition | undefined
  }

  findByScene(sceneId: number): ScenePosition | undefined {
    const stmt = this.db.prepare('SELECT * FROM scene_positions WHERE scene_id = ?')
    return stmt.get(sceneId) as ScenePosition | undefined
  }

  findByProject(projectId: number): ScenePosition[] {
    const stmt = this.db.prepare('SELECT * FROM scene_positions WHERE project_id = ?')
    return stmt.all(projectId) as ScenePosition[]
  }

  deleteByScene(sceneId: number): boolean {
    const stmt = this.db.prepare('DELETE FROM scene_positions WHERE scene_id = ?')
    const result = stmt.run(sceneId)
    return result.changes > 0
  }
}