// src/migrations/005_refresh_tokens_device_info.ts
import { query } from '../config/database';

export const up = async () => {
  await query(`
    ALTER TABLE refresh_tokens
      ADD COLUMN IF NOT EXISTS user_agent  TEXT,
      ADD COLUMN IF NOT EXISTS ip_address  VARCHAR(45);
  `);
  console.log('✅ Migration 005: user_agent and ip_address added to refresh_tokens');
};

export const down = async () => {
  await query(`
    ALTER TABLE refresh_tokens
      DROP COLUMN IF EXISTS user_agent,
      DROP COLUMN IF EXISTS ip_address;
  `);
  console.log('✅ Migration 005 rolled back');
};