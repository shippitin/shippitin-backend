/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('refresh_tokens', {
    id:         { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id:    { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    token:      { type: 'text', notNull: true, unique: true },
    revoked:    { type: 'boolean', default: false },
    expires_at: { type: 'timestamptz', notNull: true },
    created_at: { type: 'timestamptz', default: pgm.func('NOW()') },
  }, { ifNotExists: true });

  pgm.createIndex('refresh_tokens', 'user_id',  { ifNotExists: true });
  pgm.createIndex('refresh_tokens', 'token',    { ifNotExists: true });
  pgm.createIndex('refresh_tokens', 'revoked',  { ifNotExists: true });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('refresh_tokens', { ifExists: true, cascade: true });
}