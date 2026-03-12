import type Database from 'better-sqlite3'
import type { WorldSetting } from '../../src/types'

export class WorldSettingRepository {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  create(data: {
    project_id: number
    category: string
    title: string
    content?: string
  }): WorldSetting {
    const stmt = this.db.prepare(`
      INSERT INTO world_settings (project_id, category, title, content)
      VALUES (@project_id, @category, @title, @content)
    `)

    const result = stmt.run({
      project_id: data.project_id,
      category: data.category,
      title: data.title,
      content: data.content || null,
    })

    return this.getById(result.lastInsertRowid as number)!
  }

  getById(id: number): WorldSetting | undefined {
    const stmt = this.db.prepare('SELECT * FROM world_settings WHERE id = ?')
    return stmt.get(id) as WorldSetting | undefined
  }

  getByProjectId(projectId: number): WorldSetting[] {
    const stmt = this.db.prepare(
      'SELECT * FROM world_settings WHERE project_id = ? ORDER BY category, created_at DESC'
    )
    return stmt.all(projectId) as WorldSetting[]
  }

  getByCategory(projectId: number, category: string): WorldSetting[] {
    const stmt = this.db.prepare(
      'SELECT * FROM world_settings WHERE project_id = ? AND category = ? ORDER BY created_at DESC'
    )
    return stmt.all(projectId, category) as WorldSetting[]
  }

  getCategories(projectId: number): string[] {
    const stmt = this.db.prepare(
      'SELECT DISTINCT category FROM world_settings WHERE project_id = ? ORDER BY category'
    )
    const rows = stmt.all(projectId) as { category: string }[]
    return rows.map((row) => row.category)
  }

  update(
    id: number,
    data: {
      category?: string
      title?: string
      content?: string
    }
  ): WorldSetting | undefined {
    const fields: string[] = []
    const values: any = { id }

    if (data.category !== undefined) {
      fields.push('category = @category')
      values.category = data.category
    }
    if (data.title !== undefined) {
      fields.push('title = @title')
      values.title = data.title
    }
    if (data.content !== undefined) {
      fields.push('content = @content')
      values.content = data.content
    }

    if (fields.length === 0) {
      return this.getById(id)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')

    const stmt = this.db.prepare(`
      UPDATE world_settings
      SET ${fields.join(', ')}
      WHERE id = @id
    `)

    stmt.run(values)
    return this.getById(id)
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM world_settings WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}