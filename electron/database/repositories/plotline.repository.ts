import type Database from 'better-sqlite3'
import type { Plotline } from '../../src/types'

export class PlotlineRepository {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  create(data: {
    project_id: number
    title: string
    type?: 'main' | 'sub'
    start_chapter_id?: number
    end_chapter_id?: number
    status?: 'planning' | 'writing' | 'completed'
    description?: string
    notes?: string
  }): Plotline {
    const stmt = this.db.prepare(`
      INSERT INTO plotlines (project_id, title, type, start_chapter_id, end_chapter_id, status, description, notes)
      VALUES (@project_id, @title, @type, @start_chapter_id, @end_chapter_id, @status, @description, @notes)
    `)

    const result = stmt.run({
      project_id: data.project_id,
      title: data.title,
      type: data.type || 'sub',
      start_chapter_id: data.start_chapter_id || null,
      end_chapter_id: data.end_chapter_id || null,
      status: data.status || 'planning',
      description: data.description || null,
      notes: data.notes || null,
    })

    return this.getById(result.lastInsertRowid as number)!
  }

  getById(id: number): Plotline | undefined {
    const stmt = this.db.prepare('SELECT * FROM plotlines WHERE id = ?')
    return stmt.get(id) as Plotline | undefined
  }

  getByProjectId(projectId: number): Plotline[] {
    const stmt = this.db.prepare('SELECT * FROM plotlines WHERE project_id = ? ORDER BY created_at DESC')
    return stmt.all(projectId) as Plotline[]
  }

  update(
    id: number,
    data: {
      title?: string
      type?: 'main' | 'sub'
      start_chapter_id?: number
      end_chapter_id?: number
      status?: 'planning' | 'writing' | 'completed'
      description?: string
      notes?: string
    }
  ): Plotline | undefined {
    const fields: string[] = []
    const values: any = { id }

    if (data.title !== undefined) {
      fields.push('title = @title')
      values.title = data.title
    }
    if (data.type !== undefined) {
      fields.push('type = @type')
      values.type = data.type
    }
    if (data.start_chapter_id !== undefined) {
      fields.push('start_chapter_id = @start_chapter_id')
      values.start_chapter_id = data.start_chapter_id
    }
    if (data.end_chapter_id !== undefined) {
      fields.push('end_chapter_id = @end_chapter_id')
      values.end_chapter_id = data.end_chapter_id
    }
    if (data.status !== undefined) {
      fields.push('status = @status')
      values.status = data.status
    }
    if (data.description !== undefined) {
      fields.push('description = @description')
      values.description = data.description
    }
    if (data.notes !== undefined) {
      fields.push('notes = @notes')
      values.notes = data.notes
    }

    if (fields.length === 0) {
      return this.getById(id)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')

    const stmt = this.db.prepare(`
      UPDATE plotlines
      SET ${fields.join(', ')}
      WHERE id = @id
    `)

    stmt.run(values)
    return this.getById(id)
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM plotlines WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}