import Database from 'better-sqlite3'
import { BaseRepository } from './base.repository'

export interface Project {
  id: number
  title: string
  description: string | null
  genre: string | null
  word_count: number
  chapter_count: number
  cover_image: string | null
  status: 'draft' | 'writing' | 'completed'
  created_at: string
  updated_at: string
}

export class ProjectRepository extends BaseRepository<Project> {
  constructor(db: Database.Database) {
    super(db, 'projects')
  }

  create(data: {
    title: string
    description?: string
    genre?: string
    cover_image?: string
    status?: 'draft' | 'writing' | 'completed'
  }): Project {
    const result = this.insert({
      ...data,
      word_count: 0,
      chapter_count: 0,
    })

    return this.findById(result.lastInsertRowid as number)!
  }

  updateProject(
    id: number,
    data: Partial<
      Pick<Project, 'title' | 'description' | 'genre' | 'cover_image' | 'status'>
    >
  ): Project | undefined {
    this.update(id, data)
    return this.findById(id)
  }

  findByStatus(status: Project['status']): Project[] {
    return this.findByField('status', status)
  }

  search(keyword: string): Project[] {
    const stmt = this.db.prepare(`
      SELECT * FROM projects
      WHERE title LIKE ? OR description LIKE ?
      ORDER BY updated_at DESC
    `)
    const searchTerm = `%${keyword}%`
    return stmt.all(searchTerm, searchTerm) as Project[]
  }

  updateWordCount(id: number, wordCount: number): void {
    const stmt = this.db.prepare(
      'UPDATE projects SET word_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
    stmt.run(wordCount, id)
  }

  updateChapterCount(id: number): void {
    const stmt = this.db.prepare(`
      UPDATE projects
      SET chapter_count = (
        SELECT COUNT(*) FROM chapters WHERE project_id = ?
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    stmt.run(id, id)
  }

  getStatistics(id: number): {
    totalWords: number
    totalChapters: number
    totalCharacters: number
    totalScenes: number
  } {
    const stats = this.db
      .prepare(
        `
      SELECT
        p.word_count as totalWords,
        p.chapter_count as totalChapters,
        (SELECT COUNT(*) FROM characters WHERE project_id = p.id) as totalCharacters,
        (SELECT COUNT(*) FROM scenes WHERE project_id = p.id) as totalScenes
      FROM projects p
      WHERE p.id = ?
    `
      )
      .get(id) as {
      totalWords: number
      totalChapters: number
      totalCharacters: number
      totalScenes: number
    }

    return stats
  }
}