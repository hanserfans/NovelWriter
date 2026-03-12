import type Database from 'better-sqlite3'
import type { AIConfig } from '../../src/types'

export class AIConfigRepository {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  create(data: {
    name: string
    provider: 'openai' | 'anthropic'
    api_key: string
    model: string
    temperature?: number
    max_tokens?: number
    is_default?: boolean
  }): AIConfig {
    const stmt = this.db.prepare(`
      INSERT INTO ai_configs (name, provider, api_key, model, temperature, max_tokens, is_default)
      VALUES (@name, @provider, @api_key, @model, @temperature, @max_tokens, @is_default)
    `)

    const result = stmt.run({
      name: data.name,
      provider: data.provider,
      api_key: data.api_key,
      model: data.model,
      temperature: data.temperature || 0.7,
      max_tokens: data.max_tokens || 2000,
      is_default: data.is_default ? 1 : 0,
    })

    return this.getById(result.lastInsertRowid as number)!
  }

  getById(id: number): AIConfig | undefined {
    const stmt = this.db.prepare('SELECT * FROM ai_configs WHERE id = ?')
    const row = stmt.get(id) as any
    if (row) {
      return { ...row, is_default: Boolean(row.is_default) }
    }
    return undefined
  }

  getAll(): AIConfig[] {
    const stmt = this.db.prepare('SELECT * FROM ai_configs ORDER BY is_default DESC, created_at DESC')
    const rows = stmt.all() as any[]
    return rows.map(row => ({ ...row, is_default: Boolean(row.is_default) }))
  }

  getDefault(): AIConfig | undefined {
    const stmt = this.db.prepare('SELECT * FROM ai_configs WHERE is_default = 1 LIMIT 1')
    const row = stmt.get() as any
    if (row) {
      return { ...row, is_default: Boolean(row.is_default) }
    }
    return undefined
  }

  update(
    id: number,
    data: {
      name?: string
      provider?: 'openai' | 'anthropic'
      api_key?: string
      model?: string
      temperature?: number
      max_tokens?: number
      is_default?: boolean
    }
  ): AIConfig | undefined {
    const fields: string[] = []
    const values: any = { id }

    if (data.name !== undefined) {
      fields.push('name = @name')
      values.name = data.name
    }
    if (data.provider !== undefined) {
      fields.push('provider = @provider')
      values.provider = data.provider
    }
    if (data.api_key !== undefined) {
      fields.push('api_key = @api_key')
      values.api_key = data.api_key
    }
    if (data.model !== undefined) {
      fields.push('model = @model')
      values.model = data.model
    }
    if (data.temperature !== undefined) {
      fields.push('temperature = @temperature')
      values.temperature = data.temperature
    }
    if (data.max_tokens !== undefined) {
      fields.push('max_tokens = @max_tokens')
      values.max_tokens = data.max_tokens
    }
    if (data.is_default !== undefined) {
      fields.push('is_default = @is_default')
      values.is_default = data.is_default ? 1 : 0
    }

    if (fields.length === 0) {
      return this.getById(id)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')

    const stmt = this.db.prepare(`
      UPDATE ai_configs
      SET ${fields.join(', ')}
      WHERE id = @id
    `)

    stmt.run(values)
    return this.getById(id)
  }

  setDefault(id: number): void {
    // First, unset all defaults
    const unsetStmt = this.db.prepare('UPDATE ai_configs SET is_default = 0')
    unsetStmt.run()

    // Then set the specified one as default
    const setStmt = this.db.prepare('UPDATE ai_configs SET is_default = 1 WHERE id = ?')
    setStmt.run(id)
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM ai_configs WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}