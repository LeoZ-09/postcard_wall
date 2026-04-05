export async function createImageTable(connection) {
  const sql = `
    CREATE TABLE IF NOT EXISTS images (
      id VARCHAR(36) PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      size INT NOT NULL,
      hash VARCHAR(64) NOT NULL UNIQUE,
      width INT,
      height INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  await connection.execute(sql);
}

export async function createPostcardTable(connection) {
  const sql = `
    CREATE TABLE IF NOT EXISTS postcards (
      id VARCHAR(36) PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      front_image_id VARCHAR(36) NOT NULL,
      back_image_id VARCHAR(36) NOT NULL,
      sender_name VARCHAR(100),
      recipient_name VARCHAR(100),
      sent_date DATE,
      delivered_date DATE,
      delivery_days INT,
      description TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (front_image_id) REFERENCES images(id) ON DELETE RESTRICT,
      FOREIGN KEY (back_image_id) REFERENCES images(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  await connection.execute(sql);
}

export async function createIndexes(connection) {
  const indexes = [
    { name: 'idx_postcards_code', sql: 'CREATE INDEX idx_postcards_code ON postcards(code)' },
    { name: 'idx_postcards_sent_date', sql: 'CREATE INDEX idx_postcards_sent_date ON postcards(sent_date)' },
    { name: 'idx_postcards_status', sql: 'CREATE INDEX idx_postcards_status ON postcards(status)' },
    { name: 'idx_images_hash', sql: 'CREATE INDEX idx_images_hash ON images(hash)' },
    { name: 'idx_images_filename', sql: 'CREATE INDEX idx_images_filename ON images(filename)' }
  ];

  for (const index of indexes) {
    try {
      await connection.execute(index.sql);
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        console.warn(`Index creation warning: ${error.message}`);
      }
    }
  }
}
