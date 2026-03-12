import type Database from 'better-sqlite3'
import type { TimelineEvent } from '../../src/types'

export class TimelineEventRepository {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  create(data: {
    project_id: number
    title: string
    description?: string
    event_type?: 'event' | 'milestone' | 'period'
    timeline_name?: string
    start_date: string
    end_date?: string
    color?: string
    metadata?: string
  }): TimelineEvent {
    const stmt = this.db.prepare(`
      INSERT INTO timeline_events (
        project_id, title, description, event_type, timeline_name,
        start_date, end_date, color, metadata
      )
      VALUES (
        @project_id, @title, @description, @event_type, @timeline_name,
        @start_date, @end_date, @color, @metadata
      )
    `)

    const result = stmt.run({
      project_id: data.project_id,
      title: data.title,
      description: data.description || null,
      event_type: data.event_type || 'event',
      timeline_name: data.timeline_name || 'main',
      start_date: data.start_date,
      end_date: data.end_date || null,
      color: data.color || '#1890ff',
      metadata: data.metadata || null,
    })

    return this.getById(result.lastInsertRowid as number)!
  }

  getById(id: number): TimelineEvent | undefined {
    const stmt = this.db.prepare('SELECT * FROM timeline_events WHERE id = ?')
    return stmt.get(id) as TimelineEvent | undefined
  }

  getByProject(projectId: number): TimelineEvent[] {
    const stmt = this.db.prepare(
      'SELECT * FROM timeline_events WHERE project_id = ? ORDER BY start_date ASC'
    )
    return stmt.all(projectId) as TimelineEvent[]
  }

  getByTimeline(projectId: number, timelineName: string): TimelineEvent[] {
    const stmt = this.db.prepare(
      'SELECT * FROM timeline_events WHERE project_id = ? AND timeline_name = ? ORDER BY start_date ASC'
    )
    return stmt.all(projectId, timelineName) as TimelineEvent[]
  }

  getTimelines(projectId: number): string[] {
    const stmt = this.db.prepare(
      'SELECT DISTINCT timeline_name FROM timeline_events WHERE project_id = ? ORDER BY timeline_name'
    )
    const rows = stmt.all(projectId) as { timeline_name: string }[]
    return rows.map((row) => row.timeline_name)
  }

  update(
    id: number,
    data: {
      title?: string
      description?: string
      event_type?: 'event' | 'milestone' | 'period'
      timeline_name?: string
      start_date?: string
      end_date?: string
      color?: string
      metadata?: string
    }
  ): TimelineEvent | undefined {
    const fields: string[] = []
    const values: any = { id }

    if (data.title !== undefined) {
      fields.push('title = @title')
      values.title = data.title
    }
    if (data.description !== undefined) {
      fields.push('description = @description')
      values.description = data.description
    }
    if (data.event_type !== undefined) {
      fields.push('event_type = @event_type')
      values.event_type = data.event_type
    }
    if (data.timeline_name !== undefined) {
      fields.push('timeline_name = @timeline_name')
      values.timeline_name = data.timeline_name
    }
    if (data.start_date !== undefined) {
      fields.push('start_date = @start_date')
      values.start_date = data.start_date
    }
    if (data.end_date !== undefined) {
      fields.push('end_date = @end_date')
      values.end_date = data.end_date
    }
    if (data.color !== undefined) {
      fields.push('color = @color')
      values.color = data.color
    }
    if (data.metadata !== undefined) {
      fields.push('metadata = @metadata')
      values.metadata = data.metadata
    }

    if (fields.length === 0) {
      return this.getById(id)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')

    const stmt = this.db.prepare(`
      UPDATE timeline_events
      SET ${fields.join(', ')}
      WHERE id = @id
    `)

    stmt.run(values)
    return this.getById(id)
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM timeline_events WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}