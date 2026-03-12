import Database from 'better-sqlite3'
import { BaseRepository } from './base.repository'

export interface Chapter {
  id: number
  volume_id: number | null
  project_id: number
  title: string
  content: string | null
  word_count: number
  order_index: number
  status: 'draft' | 'writing' | 'completed'
  created_at: string
  updated_at: string
}

export class ChapterRepository extends BaseRepository<Chapter> {
  constructor(db: Database.Database) {
    super(db, 'chapters')
  }

  create(data: {
    volume_id?: number
    project_id: number
    title: string
    content?: string
    status?: 'draft' | 'writing' | 'completed'
  }): Chapter {
    // Get the max order_index for this project/volume
    const orderIndex = this.getNextOrderIndex(data.project_id, data.volume_id)

    const result = this.insert({
      ...data,
      word_count: 0,
      order_index: orderIndex,
    })

    return this.findById(result.lastInsertRowid as number)!
  }

  updateChapter(
    id: number,
    data: Partial<Pick<Chapter, 'title' | 'content' | 'status' | 'volume_id'>>
  ): Chapter | undefined {
    // Calculate word count if content is provided
    if (data.content !== undefined) {
      const wordCount = this.calculateWordCount(data.content)
      this.update(id, { ...data, word_count: wordCount } as Partial<Chapter>)
    } else {
      this.update(id, data)
    }
    return this.findById(id)
  }

  findByProject(projectId: number): Chapter[] {
    const stmt = this.db.prepare(
      'SELECT * FROM chapters WHERE project_id = ? ORDER BY order_index ASC'
    )
    return stmt.all(projectId) as Chapter[]
  }

  findByVolume(volumeId: number): Chapter[] {
    const stmt = this.db.prepare(
      'SELECT * FROM chapters WHERE volume_id = ? ORDER BY order_index ASC'
    )
    return stmt.all(volumeId) as Chapter[]
  }

  updateOrder(id: number, orderIndex: number): void {
    const stmt = this.db.prepare(
      'UPDATE chapters SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
    stmt.run(orderIndex, id)
  }

  moveChapter(id: number, newVolumeId: number | null, newOrderIndex: number): void {
    const stmt = this.db.prepare(
      'UPDATE chapters SET volume_id = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
    stmt.run(newVolumeId, newOrderIndex, id)
  }

  delete(id: number): void {
    // Reorder remaining chapters
    const chapter = this.findById(id)
    if (chapter) {
      super.delete(id)
      this.reorderChapters(chapter.project_id, chapter.volume_id)
    }
  }

  private getNextOrderIndex(projectId: number, volumeId: number | null): number {
    const stmt = this.db.prepare(`
      SELECT COALESCE(MAX(order_index), -1) + 1 as next_index
      FROM chapters
      WHERE project_id = ? AND (volume_id = ? OR (volume_id IS NULL AND ? IS NULL))
    `)
    const result = stmt.get(projectId, volumeId, volumeId) as { next_index: number }
    return result.next_index
  }

  private reorderChapters(projectId: number, volumeId: number | null): void {
    const chapters = volumeId
      ? this.findByVolume(volumeId)
      : this.findByProject(projectId).filter((c) => !c.volume_id)

    const stmt = this.db.prepare('UPDATE chapters SET order_index = ? WHERE id = ?')
    chapters.forEach((chapter, index) => {
      stmt.run(index, chapter.id)
    })
  }

  private calculateWordCount(content: string): number {
    if (!content) return 0
    // Remove HTML tags and count Chinese/English words
    const text = content.replace(/<[^>]*>/g, '').trim()
    if (!text) return 0

    // Count Chinese characters
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    // Count English words
    const englishWords = text
      .replace(/[\u4e00-\u9fa5]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 0).length

    return chineseChars + englishWords
  }
}