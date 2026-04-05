import { getDatabase } from '../init.js';
import { v4 as uuidv4 } from 'uuid';

export class ImageModel {
  static async create({ filename, originalName, mimeType, size, hash, width, height }) {
    const db = getDatabase();
    const id = uuidv4();

    try {
      await db.execute(`
        INSERT INTO images (id, filename, original_name, mime_type, size, hash, width, height)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, filename, originalName, mimeType, size, hash, width, height]);

      return { id, filename, originalName, mimeType, size, hash, width, height };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate')) {
        const existing = await this.findByHash(hash);
        return existing;
      }
      throw error;
    }
  }

  static async findByHash(hash) {
    const db = getDatabase();
    const [rows] = await db.execute('SELECT * FROM images WHERE hash = ?', [hash]);
    return rows[0] || null;
  }

  static async findById(id) {
    const db = getDatabase();
    const [rows] = await db.execute('SELECT * FROM images WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findAll({ page = 1, limit = 20 } = {}) {
    const db = getDatabase();
    const offset = (page - 1) * limit;

    const [images] = await db.execute(
      `SELECT * FROM images ORDER BY created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`
    );
    const [countResult] = await db.execute('SELECT COUNT(*) as count FROM images');
    const total = countResult[0]?.count || 0;

    return {
      data: images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async delete(id) {
    const db = getDatabase();
    const image = await this.findById(id);
    if (!image) return null;

    const [countResult] = await db.execute(`
      SELECT COUNT(*) as count FROM postcards
      WHERE front_image_id = ? OR back_image_id = ?
    `, [id, id]);

    if (countResult[0]?.count > 0) {
      throw new Error(`Image is used by ${countResult[0].count} postcard(s)`);
    }

    await db.execute('DELETE FROM images WHERE id = ?', [id]);
    return image;
  }
}
