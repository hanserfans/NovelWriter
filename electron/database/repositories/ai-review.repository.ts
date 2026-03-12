import type Database from 'better-sqlite3'
import type { AIReview } from '../../src/types'

export class AIReviewRepository {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  create(data: {
    project_id: number
    chapter_id?: number
    selected_text: string
    review_type: string
    review_result: string
  }): AIReview {
    const stmt = this.db.prepare(`
      INSERT INTO ai_reviews (project_id, chapter_id, selected_text, review_type, review_result)
      VALUES (@project_id, @chapter_id, @selected_text, @review_type, @review_result)
    `)

    const result = stmt.run({
      project_id: data.project_id,
      chapter_id: data.chapter_id || null,
      selected_text: data.selected_text,
      review_type: data.review_type,
      review_result: data.review_result,
    })

    return this.getById(result.lastInsertRowid as number)!
  }

  getById(id: number): AIReview | undefined {
    const stmt = this.db.prepare('SELECT * FROM ai_reviews WHERE id = ?')
    return stmt.get(id) as AIReview | undefined
  }

  getByProject(projectId: number): AIReview[] {
    const stmt = this.db.prepare(
      'SELECT * FROM ai_reviews WHERE project_id = ? ORDER BY created_at DESC'
    )
    return stmt.all(projectId) as AIReview[]
  }

  getByChapter(chapterId: number): AIReview[] {
    const stmt = this.db.prepare(
      'SELECT * FROM ai_reviews WHERE chapter_id = ? ORDER BY created_at DESC'
    )
    return stmt.all(chapterId) as AIReview[]
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM ai_reviews WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}