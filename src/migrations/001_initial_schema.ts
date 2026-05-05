/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // ── USERS ──────────────────────────────────────────────────────────
  pgm.createTable('users', {
    id:                       { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    full_name:                { type: 'varchar(255)', notNull: true },
    email:                    { type: 'varchar(255)', notNull: true, unique: true },
    password:                 { type: 'varchar(255)', notNull: true },
    phone:                    { type: 'varchar(20)' },
    company_name:             { type: 'varchar(255)' },
    gstin:                    { type: 'varchar(50)' },
    address:                  { type: 'text' },
    city:                     { type: 'varchar(100)' },
    state:                    { type: 'varchar(100)' },
    pincode:                  { type: 'varchar(10)' },
    pan_number:               { type: 'varchar(10)' },
    company_registration_id:  { type: 'varchar(100)' },
    preferred_shipment_mode:  { type: 'varchar(50)' },
    usual_cargo_type:         { type: 'varchar(100)' },
    preferred_load_size:      { type: 'varchar(50)' },
    carrier_license_number:   { type: 'varchar(100)' },
    role:                     { type: 'varchar(20)', default: "'customer'", notNull: true },
    is_email_verified:        { type: 'boolean', default: false },
    created_at:               { type: 'timestamptz', default: pgm.func('NOW()') },
    updated_at:               { type: 'timestamptz', default: pgm.func('NOW()') },
  }, { ifNotExists: true });

  // ── BOOKINGS ───────────────────────────────────────────────────────
  pgm.createTable('bookings', {
    id:                   { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    booking_number:       { type: 'varchar(50)', notNull: true, unique: true },
    user_id:              { type: 'uuid', references: '"users"', onDelete: 'CASCADE' },
    service_type:         { type: 'varchar(50)', notNull: true },
    origin:               { type: 'varchar(255)', notNull: true },
    destination:          { type: 'varchar(255)', notNull: true },
    cargo_type:           { type: 'varchar(100)', default: "'General'" },
    weight:               { type: 'decimal(10,2)', default: 0 },
    container_type:       { type: 'varchar(50)' },
    booking_date:         { type: 'date', notNull: true },
    estimated_price:      { type: 'decimal(12,2)', default: 0 },
    special_instructions: { type: 'text' },
    status:               { type: 'varchar(50)', default: "'pending'", notNull: true },
    created_at:           { type: 'timestamptz', default: pgm.func('NOW()') },
    updated_at:           { type: 'timestamptz', default: pgm.func('NOW()') },
  }, { ifNotExists: true });

  pgm.createIndex('bookings', 'user_id',      { ifNotExists: true });
  pgm.createIndex('bookings', 'status',        { ifNotExists: true });
  pgm.createIndex('bookings', 'service_type',  { ifNotExists: true });

  // ── TRACKING EVENTS ────────────────────────────────────────────────
  pgm.createTable('tracking_events', {
    id:         { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    booking_id: { type: 'uuid', references: '"bookings"', onDelete: 'CASCADE' },
    status:     { type: 'varchar(100)', notNull: true },
    location:   { type: 'varchar(255)' },
    description:{ type: 'text' },
    timestamp:  { type: 'timestamptz', default: pgm.func('NOW()') },
  }, { ifNotExists: true });

  pgm.createIndex('tracking_events', 'booking_id', { ifNotExists: true });

  // ── RATE CARDS ─────────────────────────────────────────────────────
  pgm.createTable('rate_cards', {
    id:                  { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    service_type:        { type: 'varchar(50)', notNull: true },
    origin:              { type: 'varchar(255)', notNull: true },
    destination:         { type: 'varchar(255)', notNull: true },
    carrier:             { type: 'varchar(255)', notNull: true },
    transit_time:        { type: 'varchar(100)' },
    base_price:          { type: 'decimal(12,2)', notNull: true },
    price_per_kg:        { type: 'decimal(10,4)', default: 0 },
    price_per_container: { type: 'decimal(12,2)', default: 0 },
    container_type:      { type: 'varchar(50)' },
    is_active:           { type: 'boolean', default: true },
    valid_from:          { type: 'date' },
    valid_until:         { type: 'date' },
    surge_multiplier:    { type: 'decimal(4,2)', default: 1.0 },
    surge_reason:        { type: 'varchar(255)' },
    priority:            { type: 'integer', default: 0 },
    created_at:          { type: 'timestamptz', default: pgm.func('NOW()') },
    updated_at:          { type: 'timestamptz', default: pgm.func('NOW()') },
  }, { ifNotExists: true });

  pgm.createIndex('rate_cards', 'service_type',               { ifNotExists: true });
  pgm.createIndex('rate_cards', ['origin', 'destination'],     { ifNotExists: true });

  // ── ROUTE SEARCHES ─────────────────────────────────────────────────
  pgm.createTable('route_searches', {
    id:               { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    service_type:     { type: 'varchar(50)', notNull: true },
    origin:           { type: 'varchar(255)', notNull: true },
    destination:      { type: 'varchar(255)', notNull: true },
    search_count:     { type: 'integer', default: 1 },
    last_searched_at: { type: 'timestamptz', default: pgm.func('NOW()') },
    date:             { type: 'date', default: pgm.func('CURRENT_DATE') },
  }, { ifNotExists: true });

  pgm.addConstraint('route_searches', 'route_searches_unique',
    'UNIQUE (service_type, origin, destination, date)');

  // ── SURGE RULES ────────────────────────────────────────────────────
  pgm.createTable('surge_rules', {
    id:                { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    service_type:      { type: 'varchar(50)' },
    searches_threshold:{ type: 'integer', notNull: true },
    surge_multiplier:  { type: 'decimal(4,2)', notNull: true },
    is_active:         { type: 'boolean', default: true },
    created_at:        { type: 'timestamptz', default: pgm.func('NOW()') },
  }, { ifNotExists: true });

  // ── QUOTES ─────────────────────────────────────────────────────────
  pgm.createTable('quotes', {
    id:            { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id:       { type: 'uuid', references: '"users"', onDelete: 'CASCADE' },
    service_type:  { type: 'varchar(50)', notNull: true },
    origin:        { type: 'varchar(255)', notNull: true },
    destination:   { type: 'varchar(255)', notNull: true },
    cargo_details: { type: 'jsonb' },
    quoted_price:  { type: 'decimal(12,2)' },
    valid_until:   { type: 'timestamptz' },
    status:        { type: 'varchar(50)', default: "'active'" },
    created_at:    { type: 'timestamptz', default: pgm.func('NOW()') },
  }, { ifNotExists: true });

  // ── WALLETS ────────────────────────────────────────────────────────
  pgm.createTable('wallets', {
    id:         { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id:    { type: 'uuid', references: '"users"', onDelete: 'CASCADE', unique: true },
    balance:    { type: 'decimal(12,2)', default: 0 },
    currency:   { type: 'varchar(10)', default: "'INR'" },
    updated_at: { type: 'timestamptz', default: pgm.func('NOW()') },
  }, { ifNotExists: true });

  // ── LOCATIONS ──────────────────────────────────────────────────────
  pgm.createTable('locations', {
    id:          { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name:        { type: 'varchar(255)', notNull: true },
    code:        { type: 'varchar(20)' },
    type:        { type: 'varchar(50)', notNull: true },
    city:        { type: 'varchar(100)' },
    state:       { type: 'varchar(100)' },
    country:     { type: 'varchar(100)', default: "'India'" },
    is_active:   { type: 'boolean', default: true },
    created_at:  { type: 'timestamptz', default: pgm.func('NOW()') },
  }, { ifNotExists: true });

  pgm.createIndex('locations', 'type',     { ifNotExists: true });
  pgm.createIndex('locations', 'name',     { ifNotExists: true });
  pgm.createIndex('locations', 'is_active',{ ifNotExists: true });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('locations',      { ifExists: true, cascade: true });
  pgm.dropTable('wallets',        { ifExists: true, cascade: true });
  pgm.dropTable('quotes',         { ifExists: true, cascade: true });
  pgm.dropTable('surge_rules',    { ifExists: true, cascade: true });
  pgm.dropTable('route_searches', { ifExists: true, cascade: true });
  pgm.dropTable('rate_cards',     { ifExists: true, cascade: true });
  pgm.dropTable('tracking_events',{ ifExists: true, cascade: true });
  pgm.dropTable('bookings',       { ifExists: true, cascade: true });
  pgm.dropTable('users',          { ifExists: true, cascade: true });
}
