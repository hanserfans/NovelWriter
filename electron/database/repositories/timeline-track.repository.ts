import type Database from 'better-sqlite3'
import type { TimelineTrack } from '../../src/types'

export class TimelineTrackRepository {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  create(data: {
    project_id: number
    name: string
    color?: string
    order_index?: number
  }): TimelineTrack {
    const stmt = this.db.prepare(`
      INSERT INTO timeline_tracks (project_id, name, color, order_index)
      VALUES (@project_id, @name, @color, @order_index)
    `)

    const result = stmt.run({
      project_id: data.project_id,
      name: data.name,
      color: data.color || '#1890ff',
      order_index: data.order_index || 0,
    })

    return this.getById(result.lastInsertRowid as number)!
  }

  getById(id: number): TimelineTrack | undefined {
    const stmt = this.db.prepare('SELECT * FROM timeline_tracks WHERE id = ?')
    return stmt.get(id) as TimelineTrack | undefined
  }

  getByProject(projectId: number): TimelineTrack[] {
    const stmt = this.db.prepare(
      'SELECT * FROM timeline_tracks WHERE project_id = ? ORDER BY order_index ASC'
    )
    return stmt.all(projectId) as TimelineTrack[]
  }

  update(
    id: number,
    data: {
      name?: string
      color?: string
      order_index?: number
    }
  ): TimelineTrack | undefined {
    const fields: string[] = []
    const values: any = { id }

    if (data.name !== undefined) {
      fields.push('name = @name')
      values.name = data.name
    }
    if (data.color !== undefined) {
      fields.push('color = @color')
      values.color = data.color
    }
    if (data.order_index !== undefined) {
      fields.push('order_index = @order_index')
      values.order_index = data.order_index
    }

    if (fields.length === 0) {
      return this.getById(id)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')

    const stmt = this.db.prepare(`
      UPDATE timeline_tracks
      SET ${fields.join(', ')}
      WHERE id = @id
    `)

    stmt.run(values)
    return this.getById(id)
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM timeline_tracks WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}