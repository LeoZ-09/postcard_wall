import { getDatabase } from '../init.js';
import { v4 as uuidv4 } from 'uuid';

export class PostcardModel {
  static generateCode() {
    const prefix = 'PC';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  static calculateDeliveryDays(sentDate, deliveredDate) {
    if (!sentDate || !deliveredDate) return null;
    const sent = new Date(sentDate);
    const delivered = new Date(deliveredDate);
    const diffTime = Math.abs(delivered - sent);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  static async create({ frontImageId, backImageId, senderName, recipientName, sentDate, deliveredDate, description, status = 'pending' }) {
    const db = getDatabase();
    const id = uuidv4();
    const code = this.generateCode();
    const deliveryDays = this.calculateDeliveryDays(sentDate, deliveredDate);

    await db.execute(`
      INSERT INTO postcards (id, code, front_image_id, back_image_id, sender_name, recipient_name, sent_date, delivered_date, delivery_days, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, code, frontImageId, backImageId, senderName, recipientName, sentDate, deliveredDate, deliveryDays, description, status]);

    return this.findById(id);
  }

  static async findById(id) {
    const db = getDatabase();
    const [rows] = await db.execute(`
      SELECT
        p.*,
        fi.filename as front_filename,
        fi.original_name as front_original_name,
        fi.hash as front_hash,
        bi.filename as back_filename,
        bi.original_name as back_original_name,
        bi.hash as back_hash
      FROM postcards p
      JOIN images fi ON p.front_image_id = fi.id
      JOIN images bi ON p.back_image_id = bi.id
      WHERE p.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async findByCode(code) {
    const db = getDatabase();
    const [rows] = await db.execute(`
      SELECT
        p.*,
        fi.filename as front_filename,
        fi.original_name as front_original_name,
        fi.hash as front_hash,
        bi.filename as back_filename,
        bi.original_name as back_original_name,
        bi.hash as back_hash
      FROM postcards p
      JOIN images fi ON p.front_image_id = fi.id
      JOIN images bi ON p.back_image_id = bi.id
      WHERE p.code = ?
    `, [code]);
    return rows[0] || null;
  }

  static async findAll({ page = 1, limit = 12, status, senderName, recipientName } = {}) {
    const db = getDatabase();
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }
    if (senderName) {
      whereClause += ' AND p.sender_name LIKE ?';
      params.push(`%${senderName}%`);
    }
    if (recipientName) {
      whereClause += ' AND p.recipient_name LIKE ?';
      params.push(`%${recipientName}%`);
    }

    const baseQuery = `
      FROM postcards p
      JOIN images fi ON p.front_image_id = fi.id
      JOIN images bi ON p.back_image_id = bi.id
      ${whereClause}
    `;

    const dataQuery = `
      SELECT
        p.*,
        fi.filename as front_filename,
        fi.original_name as front_original_name,
        fi.hash as front_hash,
        bi.filename as back_filename,
        bi.original_name as back_original_name,
        bi.hash as back_hash
      ${baseQuery}
      ORDER BY p.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

    const countQuery = `SELECT COUNT(*) as count ${baseQuery}`;

    const [data] = await db.execute(dataQuery, [...params, limit, offset]);
    const [countResult] = await db.execute(countQuery, params);
    const total = countResult[0]?.count || 0;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async update(id, { senderName, recipientName, sentDate, deliveredDate, description, status }) {
    const db = getDatabase();
    const deliveryDays = this.calculateDeliveryDays(sentDate, deliveredDate);

    const updates = [];
    const params = [];

    if (senderName !== undefined) {
      updates.push('sender_name = ?');
      params.push(senderName);
    }
    if (recipientName !== undefined) {
      updates.push('recipient_name = ?');
      params.push(recipientName);
    }
    if (sentDate !== undefined) {
      updates.push('sent_date = ?');
      params.push(sentDate);
    }
    if (deliveredDate !== undefined) {
      updates.push('delivered_date = ?');
      params.push(deliveredDate);
    }
    if (deliveryDays !== null) {
      updates.push('delivery_days = ?');
      params.push(deliveryDays);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    await db.execute(`UPDATE postcards SET ${updates.join(', ')} WHERE id = ?`, params);

    return this.findById(id);
  }

  static async delete(id) {
    const db = getDatabase();
    const postcard = await this.findById(id);
    if (!postcard) return null;

    await db.execute('DELETE FROM postcards WHERE id = ?', [id]);
    return postcard;
  }

  static async getStatistics() {
    const db = getDatabase();

    const [totalResult] = await db.execute('SELECT COUNT(*) as count FROM postcards');
    const [pendingResult] = await db.execute("SELECT COUNT(*) as count FROM postcards WHERE status = 'pending'");
    const [sentResult] = await db.execute("SELECT COUNT(*) as count FROM postcards WHERE status = 'sent'");
    const [deliveredResult] = await db.execute("SELECT COUNT(*) as count FROM postcards WHERE status = 'delivered'");
    const [avgResult] = await db.execute(`SELECT AVG(delivery_days) as avg_days FROM postcards WHERE delivery_days IS NOT NULL`);

    return {
      total: totalResult[0]?.count || 0,
      pending: pendingResult[0]?.count || 0,
      sent: sentResult[0]?.count || 0,
      delivered: deliveredResult[0]?.count || 0,
      avgDeliveryDays: avgResult[0]?.avg_days ? Math.round(avgResult[0].avg_days) : null
    };
  }
}
