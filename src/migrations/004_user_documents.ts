// src/migrations/004_user_documents.ts
import { query } from '../config/database';

export const up = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS user_documents (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      file_name       VARCHAR(255) NOT NULL,
      file_type       VARCHAR(100),
      file_size       INTEGER,
      file_url        TEXT NOT NULL,
      document_type   VARCHAR(100) DEFAULT 'other',
      description     TEXT,
      created_at      TIMESTAMP DEFAULT NOW(),
      updated_at      TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
  `);
  console.log('✅ Migration 004: user_documents table created');
};

export const down = async () => {
  await query(`DROP TABLE IF EXISTS user_documents;`);
  console.log('✅ Migration 004 rolled back');
};