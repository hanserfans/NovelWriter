import Database from 'better-sqlite3'

export abstract class BaseRepository<T> {
  protected db: Database.Database
  protected tableName: string

  constructor(db: Database.Database, tableName: string) {
    this.db = db
    this.tableName = tableName
  }

  findById(id: number): T | undefined {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
    return stmt.get(id) as T | undefined
  }

  findAll(): T[] {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName}`)
    return stmt.all() as T[]
  }

  delete(id: number): void {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`)
    stmt.run(id)
  }

  count(): number {
    const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName}`)
    const result = stmt.get() as { count: number }
    return result.count
  }

  protected insert(data: Partial<T>): Database.RunResult {
    const keys = Object.keys(data).filter((key) => data[key as keyof T] !== undefined)
    const values = keys.map((key) => data[key as keyof T])
    const placeholders = keys.map(() => '?').join(', ')
    const columns = keys.join(', ')

    const stmt = this.db.prepare(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`
    )

    return stmt.run(...values)
  }

  protected update(id: number, data: Partial<T>): Database.RunResult {
    const keys = Object.keys(data).filter(
      (key) => key !== 'id' && data[key as keyof T] !== undefined
    )
    const values = keys.map((key) => data[key as keyof T])
    const setClause = keys.map((key) => `${key} = ?`).join(', ')

    const stmt = this.db.prepare(
      `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    )

    return stmt.run(...values, id)
  }

  protected findByField<K extends keyof T>(field: K, value: T[K]): T[] {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE ${String(field)} = ?`)
    return stmt.all(value) as T[]
  }

  protected findOneByField<K extends keyof T>(field: K, value: T[K]): T | undefined {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE ${String(field)} = ? LIMIT 1`)
    return stmt.get(value) as T | undefined
  }
}