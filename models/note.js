import { getDB } from '../db.js';

class NoteModel {
  constructor() {
    // Database will be initialized when needed
  }

  // Find notes with optional query conditions
  async find(query = {}) {
    const db = getDB();
    let sql = 'SELECT * FROM notes';
    const params = [];
    const conditions = [];

    // Handle different query types
    if (query.status && query.status.$ne) {
      conditions.push('status != ?');
      params.push(query.status.$ne);
    } else if (query.status) {
      conditions.push('status = ?');
      params.push(query.status);
    }

    // Handle $and conditions
    if (query.$and) {
      query.$and.forEach(condition => {
        if (condition.status && condition.status.$ne) {
          conditions.push('status != ?');
          params.push(condition.status.$ne);
        }
      });
    }

    // Handle $or conditions for search
    if (query.$or) {
      const orConditions = [];
      query.$or.forEach(condition => {
        if (condition.title && condition.title.$regex) {
          orConditions.push('title LIKE ?');
          params.push(`%${condition.title.$regex.source}%`);
        }
        if (condition.content && condition.content.$regex) {
          orConditions.push('content LIKE ?');
          params.push(`%${condition.content.$regex.source}%`);
        }
      });
      if (orConditions.length > 0) {
        conditions.push(`(${orConditions.join(' OR ')})`);
      }
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY create_date DESC';

    return await db.all(sql, params);
  }

  // Find note by ID
  async findById(id) {
    const db = getDB();
    return await db.get('SELECT * FROM notes WHERE id = ?', [id]);
  }

  // Create new note
  async save(noteData) {
    const db = getDB();
    const { title, content, status = '', color = '', create_date, edit_date = '' } = noteData;
    
    const result = await db.run(`
      INSERT INTO notes (title, content, status, color, create_date, edit_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title, content, status, color, create_date, edit_date]);
    
    // Return the created note
    return await this.findById(result.lastID);
  }

  // Update note by ID
  async findByIdAndUpdate(id, updateData, options = {}) {
    const db = getDB();
    const { title, content, status, color, edit_date } = updateData;
    
    await db.run(`
      UPDATE notes 
      SET title = ?, content = ?, status = ?, color = ?, edit_date = ?
      WHERE id = ?
    `, [title, content, status, color, edit_date, id]);
    
    if (options.new) {
      return await this.findById(id);
    }
    return { id };
  }

  // Delete note by ID
  async findByIdAndDelete(id) {
    const db = getDB();
    const note = await this.findById(id);
    if (note) {
      await db.run('DELETE FROM notes WHERE id = ?', [id]);
      return { ...note, _id: note.id };
    }
    return null;
  }

  // Validate if ID is valid (simple check for SQLite)
  static isValidObjectId(id) {
    return Number.isInteger(Number(id)) && Number(id) > 0;
  }
}

// Create a singleton instance
const noteModel = new NoteModel();

export default noteModel;
