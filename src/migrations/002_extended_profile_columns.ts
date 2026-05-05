/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Added 2026-04-30 — extended profile fields
  // Note: columns already exist in DB, this migration documents the change
  pgm.sql(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS pan_number VARCHAR(10),
      ADD COLUMN IF NOT EXISTS company_registration_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS preferred_shipment_mode VARCHAR(50),
      ADD COLUMN IF NOT EXISTS usual_cargo_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS preferred_load_size VARCHAR(50),
      ADD COLUMN IF NOT EXISTS carrier_license_number VARCHAR(100);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns('users', [
    'pan_number',
    'company_registration_id',
    'preferred_shipment_mode',
    'usual_cargo_type',
    'preferred_load_size',
    'carrier_license_number',
  ]);
}